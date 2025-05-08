import { create } from "zustand";
import { persist } from "zustand/middleware";

export type SoundCategory = 'background' | 'ui' | 'effects' | 'notification';

export interface SoundEffect {
  audio: HTMLAudioElement;
  category: SoundCategory;
  volume: number; // Individual volume multiplier
  loop: boolean;
  name: string;
}

interface AudioState {
  // Audio elements
  backgroundMusic: HTMLAudioElement | null;
  hitSound: HTMLAudioElement | null;
  successSound: HTMLAudioElement | null;
  errorSound: HTMLAudioElement | null;
  notificationSound: HTMLAudioElement | null;
  
  // Sound library
  soundEffects: Record<string, SoundEffect>;
  currentAmbient: string | null;
  
  // Control state
  isMuted: boolean;
  volume: number; // Master volume from 0 to 1
  categoryVolumes: Record<SoundCategory, number>; // Per-category volume
  
  // Setter functions
  setBackgroundMusic: (music: HTMLAudioElement) => void;
  setHitSound: (sound: HTMLAudioElement) => void;
  setSuccessSound: (sound: HTMLAudioElement) => void;
  setErrorSound: (sound: HTMLAudioElement) => void;
  setNotificationSound: (sound: HTMLAudioElement) => void;
  
  // Sound library functions
  addSound: (id: string, sound: HTMLAudioElement, options: {
    category: SoundCategory;
    volume?: number;
    loop?: boolean;
    name?: string;
  }) => void;
  playSound: (id: string) => void;
  stopSound: (id: string) => void;
  
  // Ambient sound control
  setAmbient: (id: string | null) => void;
  
  // Volume control functions
  toggleMute: () => void;
  setVolume: (volume: number) => void;
  setCategoryVolume: (category: SoundCategory, volume: number) => void;
  
  // Convenience functions for common sounds
  playHit: () => void;
  playSuccess: () => void;
  playError: () => void;
  playNotification: () => void;
  startBackgroundMusic: () => void;
  stopBackgroundMusic: () => void;
}

export const useAudio = create<AudioState>()(
  persist(
    (set, get) => ({
      backgroundMusic: null,
      hitSound: null,
      successSound: null,
      errorSound: null,
      notificationSound: null,
      soundEffects: {},
      currentAmbient: null,
      isMuted: true, // Start muted by default
      volume: 0.7, // Default volume
      categoryVolumes: {
        background: 0.5,
        ui: 0.8,
        effects: 0.9,
        notification: 0.7
      },
      
      // Setter functions
      setBackgroundMusic: (music) => {
        const { volume, isMuted } = get();
        music.volume = isMuted ? 0 : volume * 0.3; // Background music slightly lower
        music.loop = true;
        set({ backgroundMusic: music });
      },
      
      setHitSound: (sound) => set({ hitSound: sound }),
      
      setSuccessSound: (sound) => set({ successSound: sound }),
      
      setErrorSound: (sound) => set({ errorSound: sound }),
      
      setNotificationSound: (sound) => set({ notificationSound: sound }),
      
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
      },
      
      playError: () => {
        const { errorSound, isMuted, volume } = get();
        if (errorSound && !isMuted) {
          // Clone the sound to allow overlapping playback
          const soundClone = errorSound.cloneNode() as HTMLAudioElement;
          soundClone.volume = volume * 0.5;
          soundClone.play().catch(error => {
            console.log("Error sound play prevented:", error);
          });
        } else if (isMuted) {
          console.log("Error sound skipped (muted)");
        }
      },
      
      playNotification: () => {
        const { notificationSound, isMuted, volume } = get();
        if (notificationSound && !isMuted) {
          notificationSound.volume = volume * 0.4;
          notificationSound.currentTime = 0;
          notificationSound.play().catch(error => {
            console.log("Notification sound play prevented:", error);
          });
        } else if (isMuted) {
          console.log("Notification sound skipped (muted)");
        }
      },

      // Sound library functions
      addSound: (id, sound, options) => {
        const { category = 'effects', volume = 1, loop = false, name = id } = options;
        
        // Configure the sound
        sound.loop = loop;
        
        // Create the sound effect entry
        const soundEffect: SoundEffect = {
          audio: sound,
          category,
          volume,
          loop,
          name
        };
        
        // Add to the library
        set((state) => ({
          soundEffects: { ...state.soundEffects, [id]: soundEffect }
        }));
        
        console.log(`Sound '${name}' added to library as '${id}'`);
        return id;
      },
      
      playSound: (id) => {
        const { soundEffects, isMuted, volume, categoryVolumes } = get();
        
        // Check if the sound exists and if audio is not muted
        if (soundEffects[id] && !isMuted) {
          const effect = soundEffects[id];
          
          // Calculate proper volume using master, category and sound-specific volume
          const categoryVolume = categoryVolumes[effect.category];
          const effectiveVolume = volume * categoryVolume * effect.volume;
          
          // Create a clone for non-looped sounds to allow overlapping playback
          let soundToPlay = effect.audio;
          if (!effect.loop) {
            soundToPlay = effect.audio.cloneNode() as HTMLAudioElement;
          }
          
          // Set volume and play
          soundToPlay.volume = effectiveVolume;
          soundToPlay.play().catch(error => {
            console.log(`Sound '${effect.name}' play prevented:`, error);
          });
          
          console.log(`Playing sound: ${effect.name} (${id})`);
        } else if (isMuted) {
          console.log(`Sound '${id}' skipped (muted)`);
        } else {
          console.log(`Sound '${id}' not found in library`);
        }
      },
      
      stopSound: (id) => {
        const { soundEffects } = get();
        
        if (soundEffects[id]) {
          soundEffects[id].audio.pause();
          soundEffects[id].audio.currentTime = 0;
          console.log(`Sound '${soundEffects[id].name}' stopped`);
        } else {
          console.log(`Sound '${id}' not found in library to stop`);
        }
      },
      
      setAmbient: (id) => {
        const { soundEffects, currentAmbient } = get();
        
        // Stop the current ambient sound if there is one
        if (currentAmbient && soundEffects[currentAmbient]) {
          get().stopSound(currentAmbient);
        }
        
        // Set the new ambient sound
        if (id && soundEffects[id]) {
          set({ currentAmbient: id });
          get().playSound(id);
          console.log(`Ambient sound set to '${soundEffects[id].name}'`);
        } else if (id) {
          console.log(`Ambient sound '${id}' not found in library`);
        } else {
          set({ currentAmbient: null });
          console.log('Ambient sound cleared');
        }
      },
      
      setCategoryVolume: (category, newVolume) => {
        const { isMuted, soundEffects, currentAmbient } = get();
        const clampedVolume = Math.max(0, Math.min(1, newVolume));
        
        // Update the category volume
        set(state => ({
          categoryVolumes: {
            ...state.categoryVolumes,
            [category]: clampedVolume
          }
        }));
        
        // Update any currently playing sounds in this category
        if (!isMuted && category === 'background' && currentAmbient) {
          get().playSound(currentAmbient);
        }
        
        console.log(`${category} volume set to ${(clampedVolume * 100).toFixed(0)}%`);
      }
    }),
    {
      name: 'nexusforge-audio-storage',
      partialize: (state) => ({ 
        isMuted: state.isMuted, 
        volume: state.volume,
        categoryVolumes: state.categoryVolumes,
        currentAmbient: state.currentAmbient
      }),
    }
  )
);
