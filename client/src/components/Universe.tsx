import React, { useRef, useMemo, useEffect, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { 
  Text, 
  useTexture, 
  Html, 
  useKeyboardControls, 
  OrbitControls,
  Stars
} from "@react-three/drei";
import * as THREE from "three";
import { gsap } from "gsap";
import { useProjects } from "@/lib/stores/useProjects";
import { useAIAssistant } from "@/lib/stores/useAIAssistant";
import { useAudio } from "@/lib/stores/useAudio";
import { useGame } from "@/lib/stores/useGame";
import { Project } from "@shared/types";
import { initialUniverseNodes } from "@/lib/data/sampleData";
import { UniverseNode } from "@/lib/types/universe";

type ViewType = "universe" | "timeline" | "assistant" | "stats";

interface UniverseProps {
  activeView: ViewType;
  isMobile?: boolean;
}

const Universe: React.FC<UniverseProps> = ({ activeView, isMobile = false }) => {
  const { projects, selectedProject, selectProject } = useProjects();
  const { viewMode, recordInteraction, universeNodes, selectedNodeId, selectNode } = useGame();
  const groupRef = useRef<THREE.Group>(null);
  const { playHit } = useAudio();
  const [hovered, setHovered] = useState<string | null>(null);
  
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
    // For mobile, make the spiral more compact for easier viewing
    const spiralFactor = isMobile ? 0.4 : 0.5;
    const radiusBase = isMobile ? 3 : 4;
    const radiusIncrement = isMobile ? 0.6 : 0.8;
    
    return projects.map((project, index) => {
      // Arrange projects in a spiral galaxy formation
      const angle = index * spiralFactor;
      const radius = radiusBase + index * radiusIncrement;
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
  }, [projects, isMobile]);
  
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
  
  // Add fusion nodes and calculate fusion node positions
  const fusionNodesWithPositions = useMemo(() => {
    return universeNodes
      .filter(node => node.type === "fusion")
      .map((node: UniverseNode, index: number) => ({
        ...node,
        calculatedPosition: node.position || {
          // Create a position based on a spiral pattern different from projects
          x: Math.cos(index * 0.7) * (6 + index * 0.5),
          y: 4 + Math.sin(index * 0.5) * 1.5, // Higher layer for fusion nodes
          z: Math.sin(index * 0.7) * (6 + index * 0.5)
        }
      }));
  }, [universeNodes]);
  
  // Generate connections between fusion nodes and their source data
  const fusionConnections = useMemo(() => {
    const connections: {start: THREE.Vector3, end: THREE.Vector3, color: string}[] = [];
    
    // Process each fusion node
    fusionNodesWithPositions.forEach(fusionNode => {
      // Check if the fusion node has metadata with source data IDs
      if (fusionNode.metadata?.sourceDataIds) {
        const sourceIds = fusionNode.metadata.sourceDataIds as string[];
        const fusionNodePos = fusionNode.calculatedPosition;
        const fusionStart = new THREE.Vector3(fusionNodePos.x, fusionNodePos.y, fusionNodePos.z);
        
        // Connect to related projects
        sourceIds.forEach(sourceId => {
          // Try to find this source ID in projects
          const projectIndex = projects.findIndex(p => p.id === sourceId);
          if (projectIndex !== -1) {
            connections.push({
              start: fusionStart,
              end: projectPositions[projectIndex],
              color: "#7c3aed" // Purple connections for fusions
            });
          }
          
          // Connect to other fusion nodes too
          const relatedFusionIndex = fusionNodesWithPositions.findIndex(n => n.id === sourceId);
          if (relatedFusionIndex !== -1) {
            const relatedPos = fusionNodesWithPositions[relatedFusionIndex].calculatedPosition;
            connections.push({
              start: fusionStart,
              end: new THREE.Vector3(relatedPos.x, relatedPos.y, relatedPos.z),
              color: "#9333ea" // Darker purple for fusion-to-fusion connections
            });
          }
        });
      }
    });
    
    return connections;
  }, [fusionNodesWithPositions, projects, projectPositions]);
  
  // Handle select key press
  const select = useKeyboardControls((state) => state.select);
  
  // Initialize the universe with sample data if it's empty
  const { addNode } = useGame();
  useEffect(() => {
    if (universeNodes.length === 0) {
      // Wait for a moment before adding sample data to ensure everything is loaded
      const timer = setTimeout(() => {
        // Add all initial universe nodes from sample data
        initialUniverseNodes.forEach(node => {
          addNode(node);
        });
        console.log("Universe initialized with sample data");
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [universeNodes.length, addNode]);
  
  // Selection handling
  useEffect(() => {
    if (select && hovered !== null) {
      // Check if it's a project ID or a node ID
      const projectIndex = projects.findIndex(p => p.id === hovered);
      if (projectIndex !== -1) {
        selectProject(hovered);
        playHit();
        console.log(`Selected project: ${projects[projectIndex].title}`);
      } else {
        // Try to find in fusion nodes
        const fusionNode = universeNodes.find(node => node.id === hovered);
        if (fusionNode) {
          selectNode(hovered);
          playHit();
          console.log(`Selected fusion node: ${fusionNode.name}`);
        }
      }
    }
  }, [select, hovered, selectProject, selectNode, projects, universeNodes, playHit]);
  
  // Animation for the universe rotation
  useFrame((state, delta) => {
    if (groupRef.current && activeView === "universe") {
      // Adjust rotation speed based on viewMode
      const rotationSpeed = viewMode === "godmode" ? delta * 0.08 : delta * 0.05;
      groupRef.current.rotation.y += rotationSpeed;
      
      // In GodMode, add slight wobble for dynamic effect
      if (viewMode === "godmode") {
        const time = state.clock.getElapsedTime();
        groupRef.current.rotation.x = Math.sin(time * 0.2) * 0.03;
      } else {
        // Reset wobble when not in GodMode
        groupRef.current.rotation.x = 0;
      }
    }
    
    // Make hovered projects pulse slightly
    if (hovered !== null && groupRef.current) {
      // Find the child index based on hovered ID
      let hoveredNodeIndex = -1;
      
      // Check projects first (offset by 1 for central node)
      const projectIndex = projects.findIndex(p => p.id === hovered);
      if (projectIndex !== -1) {
        hoveredNodeIndex = projectIndex + 1; // +1 for central node
      }
      
      // Check fusion nodes if not found in projects
      if (hoveredNodeIndex === -1) {
        const fusionIndex = fusionNodesWithPositions.findIndex(n => n.id === hovered);
        if (fusionIndex !== -1) {
          // Fusion nodes come after projects + central node + connections
          hoveredNodeIndex = 1 + projects.length + projectConnections.length + fusionIndex;
        }
      }
      
      if (hoveredNodeIndex !== -1 && groupRef.current.children[hoveredNodeIndex]) {
        // Apply a subtle pulsing animation
        const time = state.clock.getElapsedTime();
        
        // Enhance the pulse effect in GodMode
        const pulseIntensity = viewMode === "godmode" ? 0.08 : 0.05;
        const pulseSpeed = viewMode === "godmode" ? 3 : 2;
        const scale = 1 + Math.sin(time * pulseSpeed) * pulseIntensity;
        
        groupRef.current.children[hoveredNodeIndex].scale.set(scale, scale, scale);
      }
    }
  });

  // Track if universe is active for camera positioning
  const { camera } = useThree();
  const [isActive, setIsActive] = useState(false);
  
  // Setup camera position when switching to universe view
  useEffect(() => {
    if (activeView === 'universe' && !isActive) {
      camera.position.set(0, 5, 15);
      setIsActive(true);
    } else if (activeView !== 'universe' && isActive) {
      setIsActive(false);
    }
  }, [activeView, camera, isActive]);
  
  // Calculate time-based colors for core
  const getTimeBasedColor = () => {
    const now = new Date();
    const hour = now.getHours();
    
    // Different color palettes based on time of day
    if (hour >= 5 && hour < 10) {
      // Morning - warm golden colors
      return "#ff9a00";
    } else if (hour >= 10 && hour < 16) {
      // Day - bright blue to cyan
      return "#00b3ff";
    } else if (hour >= 16 && hour < 20) {
      // Evening - orange to purple sunset
      return "#ff5500";
    } else {
      // Night - deep blues to purples
      return "#0a004d";
    }
  };
  
  // Core color based on current time
  const coreColor = useMemo(() => getTimeBasedColor(), []);
  
  return (
    <>
      {/* Cosmic background */}
      <Stars radius={100} depth={50} count={viewMode === "godmode" ? 10000 : 5000} factor={4} fade speed={0.5} />
      
      {/* Orbit controls for user interaction */}
      {activeView === "universe" && (
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          maxDistance={40}
          minDistance={5}
          enableDamping={true}
          dampingFactor={0.05}
        />
      )}
      
      {/* Basic scene lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 10, 5]} intensity={0.8} />
      <pointLight position={[0, 0, 0]} intensity={1.5} distance={20} color={coreColor} />
      
      {/* Main universe group */}
      <group ref={groupRef}>
        {/* Central hub/core of the universe with animated rings */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[1.5, 32, 32]} />
          <meshStandardMaterial 
            color={coreColor} 
            emissive={coreColor}
            emissiveIntensity={1.5}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
        
        {/* Core rings - horizontal */}
        <mesh position={[0, 0, 0]} rotation={[Math.PI/2, 0, 0]}>
          <ringGeometry args={[2.0, 2.1, 32]} />
          <meshBasicMaterial color={coreColor} transparent opacity={0.6} />
        </mesh>
        
        {/* Core rings - diagonal */}
        <mesh position={[0, 0, 0]} rotation={[Math.PI/4, Math.PI/6, 0]}>
          <ringGeometry args={[2.5, 2.6, 32]} />
          <meshBasicMaterial color={coreColor} transparent opacity={0.3} />
        </mesh>
        
        {/* Project nodes */}
        {projects.map((project, index) => {
          // Adjust sizes for mobile
          const sphereSize = isMobile ? 0.8 : 0.6;
          const fontSize = isMobile ? 0.4 : 0.3;
          const labelYOffset = isMobile ? 1.2 : 1.0;
          
          return (
            <group 
              key={project.id} 
              position={projectPositions[index]}
              onClick={() => {
                selectProject(project.id);
                playHit();
              }}
              onPointerOver={() => setHovered(project.id)}
              onPointerOut={() => setHovered(null)}
            >
              {/* Project sphere */}
              <mesh>
                <sphereGeometry args={[sphereSize, isMobile ? 12 : 16, isMobile ? 12 : 16]} />
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
              
              {/* Text label - larger on mobile for better visibility */}
              <Text
                position={[0, labelYOffset, 0]}
                fontSize={fontSize}
                color="white"
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.02}
                outlineColor="#000000"
                maxWidth={isMobile ? 3 : 2}
              >
                {project.title}
              </Text>
              
              {/* Show details on hover or selection - simplified for mobile */}
              {(hovered === project.id || selectedProject?.id === project.id) && (
                <Html
                  position={[0, -1.2, 0]}
                  center
                  distanceFactor={isMobile ? 10 : 15}
                  occlude
                >
                  <div className={`bg-black/80 p-2 rounded text-white border border-cyan-500 ${isMobile ? 'text-sm w-48' : 'text-xs w-40'}`}>
                    <p className="font-bold">{project.title}</p>
                    <p className="opacity-80">{project.type}</p>
                    <p className="text-cyan-300 mt-1 text-[10px]">Last updated: {new Date(project.updatedAt).toLocaleDateString()}</p>
                  </div>
                </Html>
              )}
            </group>
          );
        })}
        
        {/* Connection lines between related projects */}
        {projectConnections.map((connection, index) => {
          // Create a properly formatted array for THREE.js
          const positions = new Float32Array([
            connection.start.x, connection.start.y, connection.start.z,
            connection.end.x, connection.end.y, connection.end.z
          ]);
          
          // Create a buffer geometry directly with the positions
          const geometry = new THREE.BufferGeometry();
          geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
          
          return (
            <primitive 
              key={`connection-${index}`}
              object={new THREE.Line(
                geometry,
                new THREE.LineBasicMaterial({ 
                  color: connection.color, 
                  opacity: 0.6,
                  transparent: true 
                })
              )}
            />
          );
        })}
        
        {/* Fusion connections - render these before nodes */}
        {fusionConnections.map((connection, index) => {
          // Create a properly formatted array for THREE.js
          const positions = new Float32Array([
            connection.start.x, connection.start.y, connection.start.z,
            connection.end.x, connection.end.y, connection.end.z
          ]);
          
          // Create a buffer geometry directly with the positions
          const geometry = new THREE.BufferGeometry();
          geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
          
          return (
            <primitive 
              key={`fusion-connection-${index}`}
              object={new THREE.Line(
                geometry,
                new THREE.LineBasicMaterial({ 
                  color: connection.color, 
                  opacity: 0.7,
                  transparent: true,
                  linewidth: 1.5 // Slightly thicker than regular connections
                })
              )}
            />
          );
        })}
        
        {/* Fusion nodes from Reality Fusion */}
        {fusionNodesWithPositions.map((node, index) => {
          // Use the calculated position
          const position = node.calculatedPosition;
          const isSelected = selectedNodeId === node.id;
          const isHovered = hovered === node.id;
          
          // Sizing for fusion nodes - larger than regular project nodes
          const sphereSize = isMobile ? 1.0 : 0.8;
          const fontSize = isMobile ? 0.5 : 0.4;
          const labelYOffset = isMobile ? 1.4 : 1.2;
          
          // Calculate compatibility and get metadata
          const compatibility = node.metadata?.compatibility || 75;
          const sourceCount = node.metadata?.sourceDataIds ? (node.metadata.sourceDataIds as string[]).length : 0;
          const isOptimized = node.metadata?.optimized || false;
          
          return (
            <group 
              key={node.id} 
              position={[position.x, position.y, position.z]}
              onClick={() => {
                selectNode(node.id);
                playHit();
              }}
              onPointerOver={() => setHovered(node.id)}
              onPointerOut={() => setHovered(null)}
            >
              {/* Selection glow effect */}
              {isSelected && (
                <mesh>
                  <sphereGeometry args={[sphereSize * 1.5, 16, 16]} />
                  <meshBasicMaterial 
                    color="#9333ea"
                    transparent={true}
                    opacity={0.15}
                  />
                </mesh>
              )}
              
              {/* Fusion node sphere */}
              <mesh>
                <sphereGeometry args={[sphereSize, 16, 16]} />
                <meshStandardMaterial
                  color="#9333ea"
                  emissive="#6d28d9"
                  emissiveIntensity={isSelected || isHovered ? 1.0 : 0.5}
                  metalness={0.8}
                  roughness={0.2}
                />
              </mesh>
              
              {/* Node label */}
              <Text
                position={[0, labelYOffset, 0]}
                fontSize={fontSize}
                color="white"
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.02}
                outlineColor="#000000"
              >
                {node.name}
              </Text>
              
              {/* Compatibility indicator ring */}
              <mesh position={[0, 0, 0]} rotation={[Math.PI/2, 0, 0]}>
                <ringGeometry args={[sphereSize + 0.1, sphereSize + 0.2, 32]} />
                <meshBasicMaterial 
                  color={
                    compatibility > 80 ? "#4ade80" : // Green for high compatibility
                    compatibility > 60 ? "#facc15" : // Yellow for medium
                    "#f87171"                        // Red for low
                  }
                  transparent 
                  opacity={isSelected || isHovered ? 0.8 : 0.4} 
                />
              </mesh>
              
              {/* Show fusion details on hover or selection */}
              {(isHovered || isSelected) && (
                <Html
                  position={[0, -1.5, 0]}
                  center
                  distanceFactor={isMobile ? 10 : 15}
                  occlude
                >
                  <div className="bg-black/80 p-2 rounded text-white border border-purple-500 max-w-xs">
                    <p className="font-bold text-purple-300">{node.name}</p>
                    <div className="flex items-center mt-1">
                      <span className="text-xs mr-2">Compatibility:</span>
                      <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${
                            compatibility > 80 ? "bg-green-500" : 
                            compatibility > 60 ? "bg-yellow-500" : 
                            "bg-red-500"
                          }`}
                          style={{ width: `${compatibility}%` }}
                        />
                      </div>
                      <span className="text-xs ml-1">{compatibility}%</span>
                    </div>
                    <p className="text-xs mt-1">Sources: {sourceCount}</p>
                    {isOptimized && <p className="text-xs text-green-400 mt-1">✓ Optimized</p>}
                  </div>
                </Html>
              )}
            </group>
          );
        })}
      </group>
    </>
  );
};

export default Universe;