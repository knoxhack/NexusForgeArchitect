import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AudioState {
  backgroundMusic: HTMLAudioElement | null;
  hitSound: HTMLAudioElement | null;
  successSound: HTMLAudioElement | null;
  isMuted: boolean;
  volume: number; // Master volume from 0 to 1
  
  // Setter functions
  setBackgroundMusic: (music: HTMLAudioElement) => void;
  setHitSound: (sound: HTMLAudioElement) => void;
  setSuccessSound: (sound: HTMLAudioElement) => void;
  
  // Control functions
  toggleMute: () => void;
  setVolume: (volume: number) => void;
  playHit: () => void;
  playSuccess: () => void;
  startBackgroundMusic: () => void;
  stopBackgroundMusic: () => void;
}

export const useAudio = create<AudioState>()(
  persist(
    (set, get) => ({
      backgroundMusic: null,
      hitSound: null,
      successSound: null,
      isMuted: true, // Start muted by default
      volume: 0.7, // Default volume
      
      // Setter functions
      setBackgroundMusic: (music) => {
        const { volume, isMuted } = get();
        music.volume = isMuted ? 0 : volume * 0.3; // Background music slightly lower
        music.loop = true;
        set({ backgroundMusic: music });
      },
      
      setHitSound: (sound) => set({ hitSound: sound }),
      
      setSuccessSound: (sound) => set({ successSound: sound }),
      
      // Volume controls
      toggleMute: () => {
        const { isMuted, backgroundMusic, volume } = get();
        const newMutedState = !isMuted;
        
        // Update all currently loaded audio
        if (backgroundMusic) {
          backgroundMusic.volume = newMutedState ? 0 : volume * 0.3;
        }
        
        // Update the state
        set({ isMuted: newMutedState });
        
        // Log the change
        console.log(`Sound ${newMutedState ? 'muted' : 'unmuted'}`);
      },
      
      setVolume: (newVolume) => {
        const { backgroundMusic, isMuted } = get();
        const clampedVolume = Math.max(0, Math.min(1, newVolume));
        
        // Only adjust volume on active audio elements if not muted
        if (!isMuted && backgroundMusic) {
          backgroundMusic.volume = clampedVolume * 0.3; // Background slightly lower
        }
        
        // Update state
        set({ volume: clampedVolume });
        console.log(`Volume set to ${(clampedVolume * 100).toFixed(0)}%`);
      },
      
      // Background music control
      startBackgroundMusic: () => {
        const { backgroundMusic, isMuted, volume } = get();
        if (backgroundMusic) {
          // Set the correct volume based on mute state
          backgroundMusic.volume = isMuted ? 0 : volume * 0.3;
          backgroundMusic.play()
            .then(() => console.log("Background music started"))
            .catch(error => console.log("Background music play prevented:", error));
        }
      },
      
      stopBackgroundMusic: () => {
        const { backgroundMusic } = get();
        if (backgroundMusic) {
          backgroundMusic.pause();
          backgroundMusic.currentTime = 0;
          console.log("Background music stopped");
        }
      },
      
      // Sound effects
      playHit: () => {
        const { hitSound, isMuted, volume } = get();
        if (hitSound && !isMuted) {
          // Clone the sound to allow overlapping playback
          const soundClone = hitSound.cloneNode() as HTMLAudioElement;
          soundClone.volume = volume * 0.4; // Slightly louder than background
          soundClone.play().catch(error => {
            console.log("Hit sound play prevented:", error);
          });
        } else if (isMuted) {
          console.log("Hit sound skipped (muted)");
        }
      },
      
      playSuccess: () => {
        const { successSound, isMuted, volume } = get();
        if (successSound && !isMuted) {
          successSound.volume = volume * 0.5; // Success sounds are highlight sounds
          successSound.currentTime = 0;
          successSound.play().catch(error => {
            console.log("Success sound play prevented:", error);
          });
        } else if (isMuted) {
          console.log("Success sound skipped (muted)");
        }
      }
    }),
    {
      name: 'nexusforge-audio-storage',
      partialize: (state) => ({ 
        isMuted: state.isMuted, 
        volume: state.volume 
      }),
    }
  )
);
