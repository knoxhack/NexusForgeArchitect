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
  tutorialCompleted: boolean;
  accessibilityMode: boolean;
  highContrastMode: boolean;
  reducedMotion: boolean;
  
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
      tutorialCompleted: false,
      accessibilityMode: false,
      highContrastMode: false,
      reducedMotion: false,
      
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
        reducedMotion: state.reducedMotion
      }),
    }
  )
);
