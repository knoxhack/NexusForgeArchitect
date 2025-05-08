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

interface ThreeSceneProps {
  activeView: string;
}

const ThreeScene: React.FC<ThreeSceneProps> = ({ activeView }) => {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);
  const [targetPosition] = useState(new THREE.Vector3(0, 10, 20));
  const [targetLookAt] = useState(new THREE.Vector3(0, 0, 0));
  const { phase } = useGame();
  
  // Extract keyboard controls
  const forward = useKeyboardControls((state) => state.forward);
  const backward = useKeyboardControls((state) => state.backward);
  const leftward = useKeyboardControls((state) => state.leftward);
  const rightward = useKeyboardControls((state) => state.rightward);
  const zoom = useKeyboardControls((state) => state.zoom);
  const unzoom = useKeyboardControls((state) => state.unzoom);
  
  // Position the camera based on the active view
  useEffect(() => {
    if (activeView === "universe") {
      targetPosition.set(0, 10, 20);
      targetLookAt.set(0, 0, 0);
    } else if (activeView === "timeline") {
      targetPosition.set(0, 5, 15);
      targetLookAt.set(0, 0, -5);
    } else if (activeView === "assistant") {
      targetPosition.set(5, 2, 10);
      targetLookAt.set(0, 0, 0);
    } else if (activeView === "stats") {
      targetPosition.set(-5, 8, 15);
      targetLookAt.set(0, 0, 0);
    }
    
    // Log the camera position change for debugging
    console.log(`Camera position changing to: ${targetPosition.x}, ${targetPosition.y}, ${targetPosition.z}`);
  }, [activeView, targetPosition, targetLookAt]);
  
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
    
    // Handle keyboard navigation
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
        count={5000}
        factor={4}
        saturation={0}
        fade
        speed={1}
      />
      
      {/* Main universe visualization */}
      <Universe activeView={activeView} />
      
      {/* Environment lighting for better 3D object appearance */}
      <Environment preset="night" />
    </>
  );
};

export default ThreeScene;
