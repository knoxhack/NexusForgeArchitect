import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { persist } from "zustand/middleware";

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
  
  // Actions
  start: () => void;
  restart: () => void;
  end: () => void;
  setViewMode: (mode: ViewMode) => void;
  recordInteraction: () => void;
  setNavPosition: (pos: { x: number; y: number; z: number }) => void;
  setInitialized: (value: boolean) => void;
  toggleNotifications: () => void;
}

export const useGame = create<GameState>()(
  persist(
    subscribeWithSelector((set) => ({
      phase: "ready",
      viewMode: "default",
      lastInteraction: Date.now(),
      interactionCount: 0,
      navPosition: { x: 0, y: 10, z: 20 },
      initialized: false,
      notifications: true,
      
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
      }
    })),
    {
      name: 'nexusforge-game-storage',
      partialize: (state) => ({
        viewMode: state.viewMode,
        interactionCount: state.interactionCount,
        initialized: state.initialized,
        notifications: state.notifications
      }),
    }
  )
);
