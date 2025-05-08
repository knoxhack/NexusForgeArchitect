import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { persist } from "zustand/middleware";
import { NodeType, UniverseNode } from "../types/universe";

export type GamePhase = "ready" | "playing" | "ended";
export type ViewMode = "default" | "godmode" | "focus" | "analytics";

interface GameState {
  phase: GamePhase;
  viewMode: ViewMode;
  lastInteraction: number;
  interactionCount: number;
  navPosition: { x: number; y: number; z: number };
  initialized: boolean;
  notifications: boolean;
  tutorialCompleted: boolean;
  accessibilityMode: boolean;
  highContrastMode: boolean;
  reducedMotion: boolean;
  universeNodes: UniverseNode[];
  selectedNodeId: string | null;
  
  // Actions
  start: () => void;
  restart: () => void;
  end: () => void;
  setViewMode: (mode: ViewMode) => void;
  recordInteraction: () => void;
  setNavPosition: (pos: { x: number; y: number; z: number }) => void;
  setInitialized: (value: boolean) => void;
  toggleNotifications: () => void;
  completeTutorial: () => void;
  toggleAccessibilityMode: () => void;
  toggleHighContrastMode: () => void;
  toggleReducedMotion: () => void;
  resetAccessibilitySettings: () => void;
  
  // Universe nodes actions
  addNode: (node: UniverseNode) => void;
  removeNode: (id: string) => void;
  updateNode: (id: string, updates: Partial<UniverseNode>) => void;
  connectNodes: (sourceId: string, targetId: string) => void;
  disconnectNodes: (sourceId: string, targetId: string) => void;
  selectNode: (id: string | null) => void;
  
  // Fusion-specific actions
  createFusionNode: (name: string, sourceDataIds: string[], metadata?: Record<string, any>) => string;
  getFusionNodes: () => UniverseNode[];
  
  // Tutorial management
  resetTutorial: () => void;
}

export const useGame = create<GameState>()(
  persist(
    subscribeWithSelector((set, get) => ({
      phase: "ready",
      viewMode: "default",
      lastInteraction: Date.now(),
      interactionCount: 0,
      navPosition: { x: 0, y: 10, z: 20 },
      initialized: false,
      notifications: true,
      tutorialCompleted: false,
      accessibilityMode: false,
      highContrastMode: false,
      reducedMotion: false,
      universeNodes: [],
      selectedNodeId: null,
      
      start: () => {
        set((state) => {
          // Only transition from ready to playing
          if (state.phase === "ready") {
            // Record this interaction
            return { 
              phase: "playing",
              lastInteraction: Date.now(),
              interactionCount: state.interactionCount + 1
            };
          }
          return {};
        });
      },
      
      restart: () => {
        set((state) => ({ 
          phase: "ready",
          lastInteraction: Date.now(),
          interactionCount: state.interactionCount + 1
        }));
      },
      
      end: () => {
        set((state) => {
          // Only transition from playing to ended
          if (state.phase === "playing") {
            return { 
              phase: "ended",
              lastInteraction: Date.now()
            };
          }
          return {};
        });
      },
      
      setViewMode: (mode: ViewMode) => {
        set((state) => ({ 
          viewMode: mode,
          lastInteraction: Date.now(),
          interactionCount: state.interactionCount + 1
        }));
      },
      
      recordInteraction: () => {
        set((state) => ({ 
          lastInteraction: Date.now(),
          interactionCount: state.interactionCount + 1
        }));
      },
      
      setNavPosition: (pos: { x: number; y: number; z: number }) => {
        set(() => ({ navPosition: pos }));
      },
      
      setInitialized: (value: boolean) => {
        set(() => ({ initialized: value }));
      },
      
      toggleNotifications: () => {
        set((state) => ({ 
          notifications: !state.notifications,
          lastInteraction: Date.now()
        }));
      },
      
      completeTutorial: () => {
        set((state) => ({
          tutorialCompleted: true,
          lastInteraction: Date.now(),
          interactionCount: state.interactionCount + 1
        }));
      },

      resetTutorial: () => {
        set((state) => ({
          tutorialCompleted: false,
          lastInteraction: Date.now(),
          interactionCount: state.interactionCount + 1
        }));
      },
      
      toggleAccessibilityMode: () => {
        set((state) => ({
          accessibilityMode: !state.accessibilityMode,
          lastInteraction: Date.now()
        }));
      },
      
      toggleHighContrastMode: () => {
        set((state) => ({
          highContrastMode: !state.highContrastMode,
          lastInteraction: Date.now()
        }));
        
        // Apply high contrast to the document
        const htmlElement = document.documentElement;
        htmlElement.classList.toggle('high-contrast');
      },
      
      toggleReducedMotion: () => {
        set((state) => ({
          reducedMotion: !state.reducedMotion,
          lastInteraction: Date.now()
        }));
        
        // Apply reduced motion to the document
        const htmlElement = document.documentElement;
        htmlElement.classList.toggle('reduced-motion');
      },
      
      resetAccessibilitySettings: () => {
        set((state) => ({
          accessibilityMode: false,
          highContrastMode: false,
          reducedMotion: false,
          lastInteraction: Date.now()
        }));
        
        // Remove all accessibility classes from the document
        const htmlElement = document.documentElement;
        htmlElement.classList.remove('high-contrast', 'reduced-motion');
      },
      
      // Universe nodes methods
      addNode: (node: UniverseNode) => {
        set((state) => {
          // Check if node with this ID already exists
          const exists = state.universeNodes.some(n => n.id === node.id);
          if (exists) return {}; // Don't add duplicate nodes
          
          return {
            universeNodes: [...state.universeNodes, node],
            lastInteraction: Date.now(),
            interactionCount: state.interactionCount + 1
          };
        });
      },
      
      removeNode: (id: string) => {
        set((state) => {
          // Filter out the node with the given ID
          const filteredNodes = state.universeNodes.filter(node => node.id !== id);
          
          // Also update any connections that might reference this node
          const updatedNodes = filteredNodes.map(node => ({
            ...node,
            connections: node.connections.filter(connectionId => connectionId !== id)
          }));
          
          return {
            universeNodes: updatedNodes,
            // If the removed node was selected, clear selection
            selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
            lastInteraction: Date.now(),
            interactionCount: state.interactionCount + 1
          };
        });
      },
      
      updateNode: (id: string, updates: Partial<UniverseNode>) => {
        set((state) => {
          const updatedNodes = state.universeNodes.map(node => 
            node.id === id ? { ...node, ...updates, lastModified: new Date().toISOString() } : node
          );
          
          return {
            universeNodes: updatedNodes,
            lastInteraction: Date.now(),
            interactionCount: state.interactionCount + 1
          };
        });
      },
      
      connectNodes: (sourceId: string, targetId: string) => {
        set((state) => {
          // Make sure both nodes exist and are not the same
          if (sourceId === targetId) return {};
          
          const sourceExists = state.universeNodes.some(node => node.id === sourceId);
          const targetExists = state.universeNodes.some(node => node.id === targetId);
          
          if (!sourceExists || !targetExists) return {};
          
          // Update the connections for the source node if not already connected
          const updatedNodes = state.universeNodes.map(node => {
            if (node.id === sourceId && !node.connections.includes(targetId)) {
              return {
                ...node,
                connections: [...node.connections, targetId],
                lastModified: new Date().toISOString()
              };
            }
            return node;
          });
          
          return {
            universeNodes: updatedNodes,
            lastInteraction: Date.now(),
            interactionCount: state.interactionCount + 1
          };
        });
      },
      
      disconnectNodes: (sourceId: string, targetId: string) => {
        set((state) => {
          // Update the connections for the source node
          const updatedNodes = state.universeNodes.map(node => {
            if (node.id === sourceId) {
              return {
                ...node,
                connections: node.connections.filter(id => id !== targetId),
                lastModified: new Date().toISOString()
              };
            }
            return node;
          });
          
          return {
            universeNodes: updatedNodes,
            lastInteraction: Date.now(),
            interactionCount: state.interactionCount + 1
          };
        });
      },
      
      selectNode: (id: string | null) => {
        set((state) => ({
          selectedNodeId: id,
          lastInteraction: Date.now(),
          interactionCount: state.interactionCount + 1
        }));
      },
      
      // Fusion node specific methods
      createFusionNode: (name: string, sourceDataIds: string[], metadata?: Record<string, any>) => {
        // Generate a unique ID for the fusion node
        const id = `fusion-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const now = new Date().toISOString();
        
        // Create default position offset from center - will be adjusted in Universe view
        // for proper visualization and to avoid overlapping
        const defaultPosition = {
          x: (Math.random() - 0.5) * 10,
          y: 3 + Math.random() * 3,
          z: (Math.random() - 0.5) * 10
        };
        
        // Create a new fusion node
        const fusionNode: UniverseNode = {
          id,
          type: "fusion",
          name,
          position: defaultPosition,
          scale: 1.2, // Slightly larger than regular nodes
          color: "#7c3aed", // Purple for fusion nodes
          connections: [], // Will be populated when connecting to source nodes
          dateCreated: now,
          lastModified: now,
          metadata: {
            ...metadata,
            sourceDataIds: sourceDataIds, // Store source data IDs for connections
          }
        };
        
        set((state) => {
          // Add the fusion node
          const newNodes = [...state.universeNodes, fusionNode];
          
          // Create connections to all source data nodes
          const nodesWithConnections = newNodes.map(node => {
            if (sourceDataIds.includes(node.id)) {
              // If this is a source node, connect it to the fusion node
              return {
                ...node,
                connections: [...node.connections, id],
                lastModified: now
              };
            }
            return node;
          });
          
          return {
            universeNodes: nodesWithConnections,
            lastInteraction: Date.now(),
            interactionCount: state.interactionCount + 1
          };
        });
        
        // Return the ID of the created fusion node
        return id;
      },
      
      getFusionNodes: (): UniverseNode[] => {
        // Get current state directly (not in a set call)
        const state = get();
        return state.universeNodes.filter(node => node.type === "fusion");
      }
    })),
    {
      name: 'nexusforge-game-storage',
      partialize: (state) => ({
        viewMode: state.viewMode,
        interactionCount: state.interactionCount,
        initialized: state.initialized,
        notifications: state.notifications,
        tutorialCompleted: state.tutorialCompleted,
        accessibilityMode: state.accessibilityMode,
        highContrastMode: state.highContrastMode,
        reducedMotion: state.reducedMotion,
        universeNodes: state.universeNodes,
        selectedNodeId: state.selectedNodeId
      }),
    }
  )
);
