import React, { useState, useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { 
  Stars, 
  PointerLockControls, 
  PerspectiveCamera, 
  Environment, 
  useKeyboardControls 
} from "@react-three/drei";
import * as THREE from "three";
import Universe from "./Universe";
import { useGame } from "@/lib/stores/useGame";
import { useIsMobile } from "@/hooks/use-is-mobile";

type ViewType = "universe" | "timeline" | "assistant" | "stats";

interface ThreeSceneProps {
  activeView: ViewType;
}

const ThreeScene: React.FC<ThreeSceneProps> = ({ activeView }) => {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);
  const [targetPosition] = useState(new THREE.Vector3(0, 10, 20));
  const [targetLookAt] = useState(new THREE.Vector3(0, 0, 0));
  const { phase } = useGame();
  const isMobile = useIsMobile();
  
  // Extract keyboard controls for desktop
  const forward = useKeyboardControls((state) => state.forward);
  const backward = useKeyboardControls((state) => state.backward);
  const leftward = useKeyboardControls((state) => state.leftward);
  const rightward = useKeyboardControls((state) => state.rightward);
  const zoom = useKeyboardControls((state) => state.zoom);
  const unzoom = useKeyboardControls((state) => state.unzoom);
  
  // Handle touch controls for mobile
  const [touchStartPos, setTouchStartPos] = useState<{ x: number; y: number } | null>(null);
  
  // Add touch event listeners
  useEffect(() => {
    if (!isMobile) return;
    
    // Touch event handlers
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        setTouchStartPos({
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        });
      }
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      // Handle pinch zoom (2 touches)
      if (e.touches.length === 2) {
        // Calculate the distance between two touch points
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const distance = Math.hypot(
          touch1.clientX - touch2.clientX,
          touch1.clientY - touch2.clientY
        );
        
        // Store the distance for next pinch zoom calculation
        const prevDistance = (window as any).prevPinchDistance || distance;
        (window as any).prevPinchDistance = distance;
        
        // Calculate zoom direction and apply zoom
        const zoomDirection = distance > prevDistance ? 1 : -1;
        const zoomSpeed = 0.5;
        
        // Zoom in or out
        const direction = new THREE.Vector3()
          .subVectors(targetLookAt, targetPosition)
          .normalize();
        targetPosition.addScaledVector(direction, zoomSpeed * zoomDirection);
        
        // Log pinch zoom for debugging
        console.log(`Pinch zoom: direction=${zoomDirection > 0 ? 'in' : 'out'}, distance=${distance.toFixed(1)}, prev=${prevDistance.toFixed(1)}`);
        return;
      }
      
      // Handle normal touch movement (1 touch)
      if (!touchStartPos || e.touches.length !== 1) return;
      
      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStartPos.x;
      const deltaY = touch.clientY - touchStartPos.y;
      
      // Update touch start position
      setTouchStartPos({
        x: touch.clientX,
        y: touch.clientY,
      });
      
      // Movement speed factor - adjusted for screen size for consistent feel
      // This makes controls work similarly regardless of device pixel density
      const baseSpeed = 0.05;
      const screenWidthFactor = window.innerWidth / 1000; // Normalize to a standard width
      const speed = baseSpeed / Math.max(0.5, screenWidthFactor); // Prevent overly sensitive controls
      
      // Move based on touch deltas
      // Horizontal movement (left/right)
      targetPosition.x -= deltaX * speed;
      targetLookAt.x -= deltaX * speed;
      
      // Vertical movement (forward/backward)
      targetPosition.z += deltaY * speed;
      targetLookAt.z += deltaY * speed;
      
      // Log touch movement for debugging
      if (deltaX !== 0 || deltaY !== 0) {
        console.log(`Touch move: dx=${deltaX.toFixed(1)}, dy=${deltaY.toFixed(1)}, new pos=[${targetPosition.x.toFixed(1)}, ${targetPosition.y.toFixed(1)}, ${targetPosition.z.toFixed(1)}]`);
      }
    };
    
    const handleTouchEnd = () => {
      setTouchStartPos(null);
      // Reset pinch distance when touch ends
      (window as any).prevPinchDistance = null;
    };
    
    // Add event listeners to window
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('touchcancel', handleTouchEnd);
    
    // Clean up event listeners
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [isMobile, targetPosition, targetLookAt, touchStartPos]);
  
  // Position the camera based on the active view
  useEffect(() => {
    // More aggressive adjustments for mobile devices
    // Both bring camera closer and adjust height for better perspective
    const mobileFactor = isMobile ? 0.7 : 1;
    const mobileHeightAdjust = isMobile ? 1.2 : 1; // Slightly higher viewing angle on mobile
    
    if (activeView === "universe") {
      targetPosition.set(0, 10 * mobileHeightAdjust, 20 * mobileFactor);
      targetLookAt.set(0, 0, 0);
    } else if (activeView === "timeline") {
      targetPosition.set(0, 5 * mobileHeightAdjust, 15 * mobileFactor);
      targetLookAt.set(0, 0, -5 * mobileFactor);
    } else if (activeView === "assistant") {
      targetPosition.set(5 * mobileFactor, 2 * mobileHeightAdjust, 10 * mobileFactor);
      targetLookAt.set(0, 0, 0);
    } else if (activeView === "stats") {
      targetPosition.set(-5 * mobileFactor, 8 * mobileHeightAdjust, 15 * mobileFactor);
      targetLookAt.set(0, 0, 0);
    }
    
    // Log the camera position change for debugging
    console.log(`Camera position changing to: ${targetPosition.x}, ${targetPosition.y}, ${targetPosition.z}`);
  }, [activeView, targetPosition, targetLookAt, isMobile]);
  
  // Handle camera movement using keyboard controls
  useFrame((state, delta) => {
    const speed = 0.5;
    const zoomSpeed = 1;
    
    // Smoothly interpolate camera position towards target
    state.camera.position.lerp(targetPosition, 0.05);
    
    // Update lookAt target
    const currentLookAt = new THREE.Vector3();
    currentLookAt.copy(targetLookAt);
    state.camera.lookAt(currentLookAt);
    
    // Handle keyboard navigation (for desktop)
    if (!isMobile) {
      if (forward) {
        targetPosition.z -= speed;
        targetLookAt.z -= speed;
        console.log("Moving forward", targetPosition);
      }
      
      if (backward) {
        targetPosition.z += speed;
        targetLookAt.z += speed;
        console.log("Moving backward", targetPosition);
      }
      
      if (leftward) {
        targetPosition.x -= speed;
        targetLookAt.x -= speed;
        console.log("Moving left", targetPosition);
      }
      
      if (rightward) {
        targetPosition.x += speed;
        targetLookAt.x += speed;
        console.log("Moving right", targetPosition);
      }
      
      if (zoom) {
        // Zoom in by moving camera closer to target
        const direction = new THREE.Vector3().subVectors(targetLookAt, targetPosition).normalize();
        targetPosition.addScaledVector(direction, zoomSpeed);
        console.log("Zooming in", targetPosition);
      }
      
      if (unzoom) {
        // Zoom out by moving camera away from target
        const direction = new THREE.Vector3().subVectors(targetLookAt, targetPosition).normalize();
        targetPosition.addScaledVector(direction, -zoomSpeed);
        console.log("Zooming out", targetPosition);
      }
    }
  });
  
  return (
    <>
      {/* Ambient lighting */}
      <ambientLight intensity={0.2} />
      
      {/* Main directional light like sun */}
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={0.8} 
        color="#a0d8ef" 
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      
      {/* Background stars for cosmic feel */}
      <Stars 
        radius={100}
        depth={50}
        count={isMobile ? 3000 : 5000} // Reduce stars count on mobile for better performance
        factor={4}
        saturation={0}
        fade
        speed={1}
      />
      
      {/* Main universe visualization */}
      <Universe activeView={activeView} isMobile={isMobile} />
      
      {/* Environment lighting for better 3D object appearance */}
      <Environment preset="night" />
    </>
  );
};

export default ThreeScene;
