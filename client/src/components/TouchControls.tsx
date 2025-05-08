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
  
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        touchAction: "none",
        zIndex: 1,
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      {/* Visual indicators for touch controls */}
      <div className="touch-controls-hint">
        <div className="absolute bottom-4 left-0 right-0 text-center text-white/70 text-sm bg-black/30 py-1">
          Drag to navigate • Pinch to zoom
        </div>
      </div>
    </div>
  );
};

export default TouchControls;