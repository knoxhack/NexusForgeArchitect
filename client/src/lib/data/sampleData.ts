import { UniverseNode } from "../types/universe";
import { Project, AI_Persona, TimelineEvent } from "@shared/types";

// Sample universe nodes for initial display
export const initialUniverseNodes: UniverseNode[] = [
  {
    id: "project-1",
    type: "project",
    name: "Fantasy Biome Showcase",
    position: { x: 3, y: 1, z: 2 },
    scale: 1,
    color: "#3b82f6", // blue
    connections: ["project-3", "project-5"],
    dateCreated: "2023-08-15T12:00:00Z",
    lastModified: "2023-10-22T09:30:00Z"
  },
  {
    id: "project-2",
    type: "project",
    name: "Dungeon Exploration BGM",
    position: { x: -4, y: 0, z: 3 },
    scale: 0.9,
    color: "#10b981", // green
    connections: ["project-1", "project-4"],
    dateCreated: "2023-09-05T15:20:00Z",
    lastModified: "2023-09-25T11:45:00Z"
  },
  {
    id: "project-3",
    type: "project",
    name: "Crystal Cave Creation Timelapse",
    position: { x: 5, y: 0.5, z: -2 },
    scale: 1.1,
    color: "#8b5cf6", // purple
    connections: ["project-1"],
    dateCreated: "2023-10-10T08:15:00Z",
    lastModified: "2023-10-11T14:30:00Z"
  },
  {
    id: "project-4",
    type: "project",
    name: "Advanced Mob Behavior System",
    position: { x: -2, y: 1, z: -4 },
    scale: 1,
    color: "#f59e0b", // amber
    connections: ["project-5"],
    dateCreated: "2023-11-20T10:10:00Z",
    lastModified: "2023-12-05T16:45:00Z"
  },
  {
    id: "project-5",
    type: "project",
    name: "Magical Artifacts Collection",
    position: { x: 0, y: 2, z: 5 },
    scale: 1.2,
    color: "#ec4899", // pink
    connections: ["project-1", "project-4"],
    dateCreated: "2023-12-15T13:30:00Z",
    lastModified: "2024-01-10T09:15:00Z"
  },
  {
    id: "fusion-1",
    type: "fusion",
    name: "Enhanced Cave Environment",
    position: { x: 4, y: 1.5, z: 0 },
    scale: 1.2,
    color: "#7c3aed", // purple
    connections: ["project-1", "project-3"],
    dateCreated: "2024-02-05T14:30:00Z",
    lastModified: "2024-02-10T09:20:00Z",
    metadata: {
      sourceDataIds: ["project-1", "project-3"],
      compatibility: 85,
      optimized: true,
      analyzed: true,
      description: "A fusion of the Fantasy Biome assets with Crystal Cave visuals for an enhanced environment",
      optimizationDate: "2024-02-08T10:15:00Z",
      analysisResults: {
        coherence: 88,
        complexity: 76,
        utility: 92,
        lastAnalyzed: "2024-02-07T16:30:00Z"
      }
    }
  },
  {
    id: "fusion-2",
    type: "fusion",
    name: "Immersive Dungeon Experience",
    position: { x: -3, y: 1.8, z: 0 },
    scale: 1.3,
    color: "#7c3aed", // purple
    connections: ["project-2", "project-4"],
    dateCreated: "2024-01-20T11:45:00Z",
    lastModified: "2024-01-25T13:10:00Z",
    metadata: {
      sourceDataIds: ["project-2", "project-4"],
      compatibility: 78,
      optimized: false,
      analyzed: true,
      description: "Combines atmospheric dungeon music with advanced AI mob behaviors for immersive gameplay",
      analysisResults: {
        coherence: 82,
        complexity: 94,
        utility: 87,
        lastAnalyzed: "2024-01-22T09:45:00Z"
      }
    }
  },
  {
    id: "fusion-3",
    type: "fusion",
    name: "Magical Artifacts Showcase",
    position: { x: 2, y: 2.5, z: 3 },
    scale: 1.25,
    color: "#7c3aed", // purple
    connections: ["project-3", "project-5"],
    dateCreated: "2024-03-01T10:00:00Z",
    lastModified: "2024-03-05T14:20:00Z",
    metadata: {
      sourceDataIds: ["project-3", "project-5"],
      compatibility: 92,
      optimized: true,
      analyzed: true,
      description: "A visual showcase combining crystal environments with magical artifact models",
      optimizationDate: "2024-03-03T16:40:00Z",
      analysisResults: {
        coherence: 95,
        complexity: 88,
        utility: 90,
        lastAnalyzed: "2024-03-02T11:30:00Z"
      }
    }
  }
];

// Sample AI personas
export const sampleAIPersonas: AI_Persona[] = [
  {
    id: "ai-1",
    name: "CodeCore",
    description: "Programming and technical assistance specialist",
    color: "#3b82f6" // blue
  },
  {
    id: "ai-2",
    name: "VidDrift",
    description: "Video editing and visual effects specialist",
    color: "#ef4444" // red
  },
  {
    id: "ai-3",
    name: "BrandGhost",
    description: "Marketing and branding strategy specialist",
    color: "#10b981" // green
  },
  {
    id: "ai-4",
    name: "Oracle",
    description: "Data analysis and forecasting specialist",
    color: "#f59e0b" // amber
  },
  {
    id: "ai-5",
    name: "Chaos",
    description: "Creative ideation and brainstorming specialist",
    color: "#8b5cf6" // purple
  }
];

// Sample timeline events
export const sampleTimelineEvents: TimelineEvent[] = [
  {
    id: "event-1",
    title: "Fantasy Biome Creation",
    description: "Initial creation of the Fantasy Biome Showcase project",
    date: "2023-08-15T12:00:00Z",
    projectId: "project-1",
    type: "creation"
  },
  {
    id: "event-2",
    title: "Dungeon Music Composition",
    description: "Composed and finished the main themes for dungeon exploration",
    date: "2023-09-05T15:20:00Z",
    projectId: "project-2",
    type: "creation"
  },
  {
    id: "event-3",
    title: "Crystal Cave Modeling",
    description: "Completed the base modeling for the Crystal Cave environment",
    date: "2023-10-10T08:15:00Z",
    projectId: "project-3",
    type: "creation"
  },
  {
    id: "event-4",
    title: "Major Biome Update",
    description: "Added new flora and fauna to the Fantasy Biome Showcase",
    date: "2023-10-22T09:30:00Z",
    projectId: "project-1",
    type: "update"
  },
  {
    id: "event-5",
    title: "AI Behavior System Development",
    description: "Initial development of the Advanced Mob Behavior System",
    date: "2023-11-20T10:10:00Z",
    projectId: "project-4",
    type: "creation"
  },
  {
    id: "event-6",
    title: "Magical Artifacts Collection Started",
    description: "Began work on the collection of magical 3D artifacts",
    date: "2023-12-15T13:30:00Z",
    projectId: "project-5",
    type: "creation"
  },
  {
    id: "event-7",
    title: "First Fusion Created",
    description: "Created the first successful fusion between music and AI behaviors",
    date: "2024-01-20T11:45:00Z",
    projectId: "fusion-2",
    type: "milestone"
  },
  {
    id: "event-8",
    title: "Enhanced Cave Environment Fusion",
    description: "Successfully fused biome and cave assets for a new environment",
    date: "2024-02-05T14:30:00Z",
    projectId: "fusion-1",
    type: "creation"
  },
  {
    id: "event-9",
    title: "Artifacts Showcase Fusion",
    description: "Created a visual showcase blending crystals and magical artifacts",
    date: "2024-03-01T10:00:00Z",
    projectId: "fusion-3",
    type: "creation"
  },
  {
    id: "event-10",
    title: "Platform Launch Preparations",
    description: "Final preparations for public launch of the platform",
    date: "2024-05-01T09:00:00Z",
    type: "milestone"
  }
];

// Sample types for RealityFusion component
export type RealityType = "audio" | "visual" | "code" | "data" | "text";

export interface RealityData {
  id: string;
  name: string;
  type: RealityType;
  description: string;
  dateCreated: string;
  thumbnail?: string;
  metadata: Record<string, any>;
}

export interface FusionResult {
  id: string;
  name: string;
  description: string;
  dateCreated: string;
  sourceDataIds: string[];
  compatibility: number;
  thumbnail?: string;
}

// Sample reality data
export const sampleRealityData: RealityData[] = [
  {
    id: "reality-1",
    name: "Mountain Ambience",
    type: "audio",
    description: "Ambient sound recordings from mountain environments",
    dateCreated: "2023-12-10T14:25:00Z",
    metadata: {
      duration: "4:32",
      format: "WAV",
      sampleRate: "48kHz"
    }
  },
  {
    id: "reality-2",
    name: "Forest Visuals",
    type: "visual",
    description: "High-quality visual assets of forest environments",
    dateCreated: "2023-11-15T09:30:00Z",
    metadata: {
      resolution: "4K",
      fileFormat: "PNG/GLB",
      assetCount: 24
    }
  },
  {
    id: "reality-3",
    name: "Weather Simulation",
    type: "code",
    description: "Dynamic weather simulation algorithms for environments",
    dateCreated: "2024-01-05T16:45:00Z",
    metadata: {
      language: "JavaScript",
      complexity: "High",
      parameters: 12
    }
  },
  {
    id: "reality-4",
    name: "Climate Dataset",
    type: "data",
    description: "Historical climate data for environmental modeling",
    dateCreated: "2023-10-20T11:20:00Z",
    metadata: {
      dataPoints: 15000,
      timeRange: "10 years",
      format: "CSV/JSON"
    }
  },
  {
    id: "reality-5",
    name: "Fantasy Lore",
    type: "text",
    description: "Comprehensive fantasy world lore and mythology",
    dateCreated: "2023-09-18T13:15:00Z",
    metadata: {
      wordCount: 25000,
      chapters: 12,
      languages: 2
    }
  },
  {
    id: "reality-6",
    name: "Cave Acoustics",
    type: "audio",
    description: "Audio recordings of various cave acoustic environments",
    dateCreated: "2024-02-12T10:35:00Z",
    metadata: {
      duration: "6:14",
      format: "WAV",
      sampleRate: "48kHz"
    }
  },
  {
    id: "reality-7",
    name: "Crystal Formations",
    type: "visual",
    description: "3D models of various crystal formations with materials",
    dateCreated: "2024-01-28T14:50:00Z",
    metadata: {
      models: 18,
      fileFormat: "GLB/FBX",
      textureResolution: "2K"
    }
  },
  {
    id: "reality-8",
    name: "Entity Behavior Scripts",
    type: "code",
    description: "AI behavior scripts for environment entities",
    dateCreated: "2023-12-24T09:15:00Z",
    metadata: {
      language: "TypeScript",
      patterns: "State Machine",
      entityTypes: 8
    }
  }
];

// Sample fusion results
export const sampleFusionResults: FusionResult[] = [
  {
    id: "fusion-result-1",
    name: "Atmospheric Forest",
    description: "A fusion of forest visuals with mountain ambience for an immersive environment",
    dateCreated: "2024-01-20T13:45:00Z",
    sourceDataIds: ["reality-1", "reality-2"],
    compatibility: 92
  },
  {
    id: "fusion-result-2",
    name: "Dynamic Weather Forest",
    description: "Forest visuals enhanced with dynamic weather simulation",
    dateCreated: "2024-02-15T11:30:00Z",
    sourceDataIds: ["reality-2", "reality-3", "reality-4"],
    compatibility: 85
  },
  {
    id: "fusion-result-3",
    name: "Mythical Crystal Caves",
    description: "Crystal formations with fantasy lore and cave acoustics",
    dateCreated: "2024-03-05T16:20:00Z",
    sourceDataIds: ["reality-5", "reality-6", "reality-7"],
    compatibility: 89
  }
];