// Project types
export type ProjectType = "video" | "model" | "audio" | "code";

export interface Project {
  id: string;
  title: string;
  description: string;
  type: ProjectType;
  createdAt: string;
  updatedAt: string;
  relatedProjects?: string[];
}

// AI assistant types
export interface AI_Persona {
  id: string;
  name: string;
  description: string;
  color: string;
}

export type MessageRole = "user" | "assistant";

export interface AI_Message {
  id: string;
  content: string;
  role: MessageRole;
  timestamp: string;
  personaId?: string;
}

// Timeline and stats types
export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  projectId?: string;
  type: "creation" | "update" | "milestone";
}

export interface CreatorMetric {
  id: string;
  name: string;
  value: number;
  period: "day" | "week" | "month" | "year";
  date: string;
}
