import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function useRotation(speed = 0.01) {
  const ref = useRef<THREE.Object3D>(null);
  
  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += speed * delta;
    }
  });
  
  return ref;
}

export function usePulse(speed = 1, amplitude = 0.1) {
  const ref = useRef<THREE.Object3D>(null);
  const initialScale = useRef<THREE.Vector3 | null>(null);
  
  useEffect(() => {
    if (ref.current) {
      initialScale.current = ref.current.scale.clone();
    }
    
    return () => {
      if (ref.current && initialScale.current) {
        ref.current.scale.copy(initialScale.current);
      }
    };
  }, []);
  
  useFrame((state) => {
    if (ref.current && initialScale.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * speed) * amplitude;
      ref.current.scale.set(
        initialScale.current.x * scale,
        initialScale.current.y * scale,
        initialScale.current.z * scale
      );
    }
  });
  
  return ref;
}

export function useHover() {
  const ref = useRef<THREE.Object3D>(null);
  const [hovered, setHovered] = useState(false);
  
  useEffect(() => {
    const current = ref.current;
    
    const onPointerOver = () => setHovered(true);
    const onPointerOut = () => setHovered(false);
    
    if (current) {
      current.addEventListener("pointerover", onPointerOver);
      current.addEventListener("pointerout", onPointerOut);
    }
    
    return () => {
      if (current) {
        current.removeEventListener("pointerover", onPointerOver);
        current.removeEventListener("pointerout", onPointerOut);
      }
    };
  }, []);
  
  return { ref, hovered };
}

export function useFollow(target: THREE.Vector3, speed = 0.1) {
  const ref = useRef<THREE.Object3D>(null);
  
  useFrame(() => {
    if (ref.current) {
      ref.current.position.lerp(target, speed);
    }
  });
  
  return ref;
}

// Missing import for useState
import { useState } from "react";
