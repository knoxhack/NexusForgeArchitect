import React, { useRef, useMemo, useEffect, useState } from "react";
import { useFrame, useLoader, useThree } from "@react-three/fiber";
import { Text, useTexture, Html, Sphere, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { useProjects } from "@/lib/stores/useProjects";
import { useAIAssistant } from "@/lib/stores/useAIAssistant";
import { useKeyboardControls } from "@react-three/drei";
import { useAudio } from "@/lib/stores/useAudio";
import { Project } from "@shared/types";

interface UniverseProps {
  activeView: string;
}

const Universe: React.FC<UniverseProps> = ({ activeView }) => {
  const { projects, selectedProject, selectProject } = useProjects();
  const { aiPersonas } = useAIAssistant();
  const groupRef = useRef<THREE.Group>(null);
  const { playHit } = useAudio();
  const [hovered, setHovered] = useState<number | null>(null);
  
  // Load textures
  const sandTexture = useTexture("/textures/sand.jpg");
  const grassTexture = useTexture("/textures/grass.png");
  const skyTexture = useTexture("/textures/sky.png");
  const woodTexture = useTexture("/textures/wood.jpg");

  // Set up texture repeats
  useEffect(() => {
    [sandTexture, grassTexture, woodTexture].forEach(texture => {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(4, 4);
    });
  }, [sandTexture, grassTexture, woodTexture]);
  
  // Calculate positions for project nodes in 3D space
  const projectPositions = useMemo(() => {
    return projects.map((project, index) => {
      // Arrange projects in a spiral galaxy formation
      const angle = index * 0.5;
      const radius = 4 + index * 0.8;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      
      // Y position based on project type to create layered effect
      let y = 0;
      if (project.type === "video") y = 1;
      if (project.type === "model") y = 2;
      if (project.type === "audio") y = -1;
      if (project.type === "code") y = -2;
      
      return new THREE.Vector3(x, y, z);
    });
  }, [projects]);
  
  // Calculate project connections (lines between related projects)
  const projectConnections = useMemo(() => {
    const connections: {start: THREE.Vector3, end: THREE.Vector3, color: string}[] = [];
    
    projects.forEach((project, i) => {
      if (project.relatedProjects && project.relatedProjects.length > 0) {
        project.relatedProjects.forEach(relatedId => {
          const relatedIndex = projects.findIndex(p => p.id === relatedId);
          if (relatedIndex !== -1) {
            // Define connection color based on relationship type
            let color = "#4a9df0"; // Default blue
            
            if (project.type === "video" && projects[relatedIndex].type === "video") {
              color = "#f04a4a"; // Red for video-video connections
            } else if (project.type === "model" || projects[relatedIndex].type === "model") {
              color = "#4af04a"; // Green for model connections
            } else if (project.type === "audio" || projects[relatedIndex].type === "audio") {
              color = "#f0e54a"; // Yellow for audio connections
            }
            
            connections.push({
              start: projectPositions[i],
              end: projectPositions[relatedIndex],
              color
            });
          }
        });
      }
    });
    
    return connections;
  }, [projects, projectPositions]);
  
  // Handle select key press
  const select = useKeyboardControls((state) => state.select);
  useEffect(() => {
    if (select && hovered !== null) {
      selectProject(projects[hovered].id);
      playHit();
      console.log(`Selected project: ${projects[hovered].title}`);
    }
  }, [select, hovered, selectProject, projects, playHit]);
  
  // Animation for the universe rotation
  useFrame((state, delta) => {
    if (groupRef.current && activeView === "universe") {
      // Slowly rotate the entire universe
      groupRef.current.rotation.y += delta * 0.05;
    }
    
    // Make hovered projects pulse slightly
    if (hovered !== null && groupRef.current) {
      const hoveredNode = groupRef.current.children[hovered];
      if (hoveredNode) {
        // Apply a subtle pulsing animation
        const time = state.clock.getElapsedTime();
        const scale = 1 + Math.sin(time * 2) * 0.05;
        hoveredNode.scale.set(scale, scale, scale);
      }
    }
  });
  
  return (
    <group ref={groupRef}>
      {/* Central hub/core of the universe */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshStandardMaterial 
          color="#00b3ff" 
          emissive="#0077ff"
          emissiveIntensity={2}
          toneMapped={false}
        />
      </mesh>
      
      {/* Project nodes */}
      {projects.map((project, index) => (
        <group 
          key={project.id} 
          position={projectPositions[index]}
          onClick={() => {
            selectProject(project.id);
            playHit();
          }}
          onPointerOver={() => setHovered(index)}
          onPointerOut={() => setHovered(null)}
        >
          {/* Project sphere */}
          <mesh>
            <sphereGeometry args={[0.6, 16, 16]} />
            <meshStandardMaterial 
              color={project.type === "video" ? "#f04a4a" : 
                     project.type === "model" ? "#4af04a" : 
                     project.type === "audio" ? "#f0e54a" : 
                     "#4a9df0"}
              roughness={0.3}
              metalness={0.8}
              map={project.type === "video" ? woodTexture : 
                   project.type === "model" ? grassTexture : 
                   project.type === "audio" ? sandTexture : 
                   skyTexture}
            />
          </mesh>
          
          {/* Text label */}
          <Text
            position={[0, 1, 0]}
            fontSize={0.3}
            color="white"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.02}
            outlineColor="#000000"
          >
            {project.title}
          </Text>
          
          {/* Show details on hover or selection */}
          {(hovered === index || selectedProject?.id === project.id) && (
            <Html
              position={[0, -1, 0]}
              center
              distanceFactor={15}
              occlude
            >
              <div className="bg-black/80 p-2 rounded text-white border border-cyan-500 text-xs w-40">
                <p className="font-bold">{project.title}</p>
                <p className="opacity-80">{project.type}</p>
                <p className="text-cyan-300 mt-1 text-[10px]">Last updated: {new Date(project.updatedAt).toLocaleDateString()}</p>
              </div>
            </Html>
          )}
        </group>
      ))}
      
      {/* Connection lines between related projects */}
      {projectConnections.map((connection, index) => (
        <line key={`connection-${index}`}>
          <bufferGeometry attach="geometry">
            <float32BufferAttribute 
              attach="attributes-position" 
              count={2}
              array={[
                connection.start.x, connection.start.y, connection.start.z,
                connection.end.x, connection.end.y, connection.end.z
              ]}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial 
            attach="material" 
            color={connection.color} 
            linewidth={1} 
            linecap="round" 
            linejoin="round"
            opacity={0.6}
            transparent
          />
        </line>
      ))}
      
      {/* AI Personas floating in the universe */}
      {aiPersonas.map((persona, index) => {
        // Position personas in a ring around the center
        const angle = (index / aiPersonas.length) * Math.PI * 2;
        const radius = 8;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const y = 3 + Math.sin(angle * 2) * 0.5; // Slight vertical variation
        
        return (
          <group key={persona.id} position={[x, y, z]}>
            <mesh>
              <octahedronGeometry args={[0.8, 0]} />
              <meshStandardMaterial 
                color={persona.color} 
                emissive={persona.color}
                emissiveIntensity={0.5}
              />
            </mesh>
            <Text
              position={[0, 1.2, 0]}
              fontSize={0.4}
              color="white"
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.02}
              outlineColor="#000000"
            >
              {persona.name}
            </Text>
          </group>
        );
      })}
    </group>
  );
};

export default Universe;
