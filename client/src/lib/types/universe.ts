// Type definitions for the Universe component

export type NodeType = "project" | "fusion" | "ai" | "milestone";

export interface Position3D {
  x: number;
  y: number;
  z: number;
}

export interface UniverseNode {
  id: string;
  type: NodeType;
  name: string;
  position: Position3D;
  scale: number;
  color: string;
  connections: string[];
  dateCreated: string;
  lastModified: string;
  metadata?: Record<string, any>;
}

export interface FusionNode extends UniverseNode {
  type: "fusion";
  metadata?: {
    sourceDataIds?: string[];
    compatibility?: number;
    optimized?: boolean;
    analyzed?: boolean;
    description?: string;
    optimizationDate?: string;
    analysisResults?: {
      coherence: number;
      complexity: number;
      utility: number;
      lastAnalyzed: string;
    };
  };
}

// Used for positioning nodes in the Universe view
export interface PositionedNode extends UniverseNode {
  calculatedPosition: Position3D;
}

// Game state phases
export type GamePhase = "loading" | "ready" | "playing" | "ended";

// View modes
export type ViewMode = "default" | "focused" | "expanded" | "minimized";