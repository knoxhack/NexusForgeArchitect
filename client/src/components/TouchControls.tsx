import React from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

interface TouchControlsProps {
  targetPosition: THREE.Vector3;
  targetLookAt: THREE.Vector3;
}

const TouchControls: React.FC<TouchControlsProps> = ({ targetPosition, targetLookAt }) => {
  const { size } = useThree();
  const [touchStartPos, setTouchStartPos] = React.useState<{ x: number; y: number } | null>(null);
  
  // Handle touch start
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      // Single touch for movement
      setTouchStartPos({
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      });
    }
  };
  
  // Handle touch move
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartPos || e.touches.length !== 1) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartPos.x;
    const deltaY = touch.clientY - touchStartPos.y;
    
    // Update touch start position
    setTouchStartPos({
      x: touch.clientX,
      y: touch.clientY,
    });
    
    // Movement speed factor
    const speed = 0.05;
    
    // Move based on touch deltas
    // Horizontal movement (left/right)
    targetPosition.x -= deltaX * speed;
    targetLookAt.x -= deltaX * speed;
    
    // Vertical movement (forward/backward)
    targetPosition.z += deltaY * speed;
    targetLookAt.z += deltaY * speed;
  };
  
  // Handle touch end
  const handleTouchEnd = () => {
    setTouchStartPos(null);
  };
  
  // Pinch to zoom
  const handlePinchZoom = (e: React.TouchEvent) => {
    if (e.touches.length !== 2) return;
    
    // Calculate the distance between two touch points
    const touch1 = e.touches[0];
    const touch2 = e.touches[1];
    const distance = Math.hypot(
      touch1.clientX - touch2.clientX,
      touch1.clientY - touch2.clientY
    );
    
    // Store the distance for next pinch zoom calculation
    const prevDistance = (e.target as any).prevPinchDistance || distance;
    (e.target as any).prevPinchDistance = distance;
    
    // Calculate zoom direction and apply zoom
    const zoomDirection = distance > prevDistance ? 1 : -1;
    const zoomSpeed = 0.5;
    
    // Zoom in or out
    const direction = new THREE.Vector3()
      .subVectors(targetLookAt, targetPosition)
      .normalize();
    targetPosition.addScaledVector(direction, zoomSpeed * zoomDirection);
  };
  
  // In Three.js/R3F context, we can't use regular HTML div elements directly
  // Let's use a group or another Three.js object that will handle the touch events
  
  // Create a transparent plane that covers the entire view to capture touch events
  React.useEffect(() => {
    // Add global touch event listeners to the window
    const handleTouchStartGlobal = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        setTouchStartPos({
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        });
      }
    };
    
    const handleTouchMoveGlobal = (e: TouchEvent) => {
      if (!touchStartPos || e.touches.length !== 1) return;
      
      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStartPos.x;
      const deltaY = touch.clientY - touchStartPos.y;
      
      // Update touch start position
      setTouchStartPos({
        x: touch.clientX,
        y: touch.clientY,
      });
      
      // Movement speed factor
      const speed = 0.05;
      
      // Move based on touch deltas
      // Horizontal movement (left/right)
      targetPosition.x -= deltaX * speed;
      targetLookAt.x -= deltaX * speed;
      
      // Vertical movement (forward/backward)
      targetPosition.z += deltaY * speed;
      targetLookAt.z += deltaY * speed;
    };
    
    const handleTouchEndGlobal = () => {
      setTouchStartPos(null);
    };
    
    const handlePinchZoomGlobal = (e: TouchEvent) => {
      if (e.touches.length !== 2) return;
      
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
    };
    
    // Add event listeners to the window
    window.addEventListener('touchstart', handleTouchStartGlobal);
    window.addEventListener('touchmove', handleTouchMoveGlobal);
    window.addEventListener('touchend', handleTouchEndGlobal);
    window.addEventListener('touchcancel', handleTouchEndGlobal);
    
    // Clean up event listeners on unmount
    return () => {
      window.removeEventListener('touchstart', handleTouchStartGlobal);
      window.removeEventListener('touchmove', handleTouchMoveGlobal);
      window.removeEventListener('touchend', handleTouchEndGlobal);
      window.removeEventListener('touchcancel', handleTouchEndGlobal);
    };
  }, [targetPosition, targetLookAt, touchStartPos]);
  
  // Return null since we're handling touch events at the window level
  // and not rendering any 3D objects
  return null;
};

export default TouchControls;