import { create } from "zustand";
import { persist } from "zustand/middleware";

// Define the types of reality data
export type RealityType = "model" | "video" | "audio" | "code" | "text";

// Interface for reality data objects
export interface RealityData {
  id: string;
  name: string;
  type: RealityType;
  description: string;
  dateCreated: string;
  size: string;
  tags: string[];
  thumbnail?: string;
}

// Interface for fusion result
export interface FusionResult {
  id: string;
  name: string;
  description: string;
  sourceDataIds: string[];
  dateCreated: string;
  type: "fusion";
  compatibility: number; // 0-100 score
  status: "pending" | "processing" | "complete" | "failed";
  previewImage?: string;
}

// Define the state for the Reality Fusion store
interface RealityFusionState {
  realityData: RealityData[];
  fusionResults: FusionResult[];
  recentFusions: string[]; // IDs of recently performed fusions
  selectedItems: string[]; // IDs of currently selected items
  
  // Actions
  addRealityData: (data: RealityData) => void;
  removeRealityData: (id: string) => void;
  addFusionResult: (result: FusionResult) => void;
  removeFusionResult: (id: string) => void;
  selectItem: (id: string) => void;
  deselectItem: (id: string) => void;
  clearSelection: () => void;
  addRecentFusion: (id: string) => void;
  
  // Getters
  getRealityDataById: (id: string) => RealityData | undefined;
}

// Initial sample data
const initialRealityData: RealityData[] = [
  {
    id: "model1",
    name: "Celestial Navigation Core",
    type: "model",
    description: "3D model of the navigation interface core structure",
    dateCreated: "2025-04-15",
    size: "24.5 MB",
    tags: ["navigation", "core", "interface"],
    thumbnail: "/images/model-thumbnail-1.jpg"
  },
  {
    id: "model2",
    name: "Project Node Representation",
    type: "model",
    description: "3D model for project nodes in the universe view",
    dateCreated: "2025-04-18",
    size: "12.8 MB",
    tags: ["node", "project", "universe"],
    thumbnail: "/images/model-thumbnail-2.jpg"
  },
  {
    id: "video1",
    name: "Multiversal Grid Animation",
    type: "video",
    description: "Animation showing the dynamic multiversal grid system",
    dateCreated: "2025-04-20",
    size: "45.2 MB",
    tags: ["animation", "grid", "system"],
    thumbnail: "/images/video-thumbnail-1.jpg"
  },
  {
    id: "audio1",
    name: "Neural Ambient Soundtrack",
    type: "audio",
    description: "Ambient sounds generated based on neural activity",
    dateCreated: "2025-04-22",
    size: "8.7 MB",
    tags: ["ambient", "neural", "soundtrack"],
    thumbnail: "/images/audio-thumbnail-1.jpg"
  },
  {
    id: "code1",
    name: "Reality Fusion Algorithm",
    type: "code",
    description: "Core algorithm implementation for reality fusion",
    dateCreated: "2025-04-25",
    size: "156 KB",
    tags: ["algorithm", "fusion", "core"],
    thumbnail: "/images/code-thumbnail-1.jpg"
  },
  {
    id: "text1",
    name: "Fusion Theory Documentation",
    type: "text",
    description: "Theoretical framework for reality fusion processes",
    dateCreated: "2025-04-10",
    size: "320 KB",
    tags: ["documentation", "theory", "process"],
    thumbnail: "/images/text-thumbnail-1.jpg"
  }
];

// Initial sample fusion results
const initialFusionResults: FusionResult[] = [
  {
    id: "fusion1",
    name: "Interactive Navigation Model",
    description: "Combined 3D model with code for interactive navigation",
    sourceDataIds: ["model1", "code1"],
    dateCreated: "2025-04-26",
    type: "fusion",
    compatibility: 92,
    status: "complete",
    previewImage: "/images/fusion-result-1.jpg"
  },
  {
    id: "fusion2",
    name: "Audiovisual Experience",
    description: "Video animation with synchronized neural audio",
    sourceDataIds: ["video1", "audio1"],
    dateCreated: "2025-04-28",
    type: "fusion",
    compatibility: 88,
    status: "complete",
    previewImage: "/images/fusion-result-2.jpg"
  }
];

// Create the store
export const useRealityFusion = create<RealityFusionState>()(
  persist(
    (set, get) => ({
      realityData: initialRealityData,
      fusionResults: initialFusionResults,
      recentFusions: ["fusion1", "fusion2"],
      selectedItems: [],
      
      // Add a new reality data item
      addRealityData: (data) => set((state) => ({
        realityData: [...state.realityData, data]
      })),
      
      // Remove a reality data item
      removeRealityData: (id) => set((state) => ({
        realityData: state.realityData.filter(item => item.id !== id)
      })),
      
      // Add a new fusion result
      addFusionResult: (result) => set((state) => ({
        fusionResults: [result, ...state.fusionResults]
      })),
      
      // Remove a fusion result
      removeFusionResult: (id) => set((state) => ({
        fusionResults: state.fusionResults.filter(item => item.id !== id)
      })),
      
      // Select an item
      selectItem: (id) => set((state) => {
        if (state.selectedItems.includes(id)) {
          return state; // Already selected
        }
        return {
          selectedItems: [...state.selectedItems, id]
        };
      }),
      
      // Deselect an item
      deselectItem: (id) => set((state) => ({
        selectedItems: state.selectedItems.filter(itemId => itemId !== id)
      })),
      
      // Clear selection
      clearSelection: () => set({
        selectedItems: []
      }),
      
      // Add a fusion result to recent fusions
      addRecentFusion: (id) => set((state) => {
        // Keep only the last 5 fusions
        const newRecentFusions = [id, ...state.recentFusions].slice(0, 5);
        return {
          recentFusions: newRecentFusions
        };
      }),
      
      // Get reality data by ID
      getRealityDataById: (id) => {
        const { realityData } = get();
        return realityData.find(item => item.id === id);
      }
    }),
    {
      name: 'nexusforge-reality-fusion',
      partialize: (state) => ({
        fusionResults: state.fusionResults,
        recentFusions: state.recentFusions,
      }),
    }
  )
);

// Helper function to get data by ID
export function getRealityDataById(id: string): RealityData | undefined {
  return useRealityFusion.getState().realityData.find(item => item.id === id);
}

// Helper function to get fusion result by ID
export function getFusionResultById(id: string): FusionResult | undefined {
  return useRealityFusion.getState().fusionResults.find(item => item.id === id);
}

// Helper function to perform a fusion
export function performFusion(
  sourceIds: string[], 
  name: string,
  description: string
): Promise<FusionResult> {
  return new Promise((resolve, reject) => {
    // Check if we have at least 2 source items
    if (sourceIds.length < 2) {
      reject(new Error("At least 2 source items are required for fusion"));
      return;
    }
    
    // Generate a simple random compatibility score between 70-100
    const compatibility = Math.floor(70 + Math.random() * 30);
    
    // Create a new fusion result
    const newFusion: FusionResult = {
      id: `fusion${Date.now()}`,
      name,
      description,
      sourceDataIds: sourceIds,
      dateCreated: new Date().toISOString().split("T")[0],
      type: "fusion",
      compatibility,
      status: "complete",
      previewImage: "/images/fusion-result-new.jpg"
    };
    
    // Add the fusion result to the store
    useRealityFusion.getState().addFusionResult(newFusion);
    
    // Add to recent fusions
    useRealityFusion.getState().addRecentFusion(newFusion.id);
    
    // Resolve with the new fusion result
    resolve(newFusion);
  });
}