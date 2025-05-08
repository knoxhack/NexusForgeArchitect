import { create } from "zustand";
import { Project, ProjectType } from "@shared/types";
import { devtools } from "zustand/middleware";

// Sample initial projects data
const initialProjects: Project[] = [
  {
    id: "1",
    title: "Fantasy Biome Showcase",
    description: "A showcase of custom Minecraft biomes with magical elements and immersive atmosphere",
    type: "model",
    createdAt: "2023-08-15T12:00:00Z",
    updatedAt: "2023-10-22T09:30:00Z",
    relatedProjects: ["3", "5"]
  },
  {
    id: "2",
    title: "Dungeon Exploration BGM",
    description: "Ambient background music for dungeon exploration sequences with atmospheric sounds",
    type: "audio",
    createdAt: "2023-09-05T15:20:00Z",
    updatedAt: "2023-09-25T11:45:00Z",
    relatedProjects: ["1", "4"]
  },
  {
    id: "3",
    title: "Crystal Cave Creation Timelapse",
    description: "Video timelapse showing the creation process of a crystal cave structure",
    type: "video",
    createdAt: "2023-10-10T08:15:00Z",
    updatedAt: "2023-10-11T14:30:00Z",
    relatedProjects: ["1"]
  },
  {
    id: "4",
    title: "Advanced Mob Behavior System",
    description: "Custom code for creating advanced AI behaviors for mobs in modded environments",
    type: "code",
    createdAt: "2023-11-20T10:10:00Z",
    updatedAt: "2023-12-05T16:45:00Z",
    relatedProjects: ["5"]
  },
  {
    id: "5",
    title: "Magical Artifacts Collection",
    description: "A collection of 3D models for magical artifacts with unique properties and effects",
    type: "model",
    createdAt: "2023-12-15T13:30:00Z",
    updatedAt: "2024-01-10T09:15:00Z",
    relatedProjects: ["1", "4"]
  },
  {
    id: "6",
    title: "Fantasy World Exploration Series",
    description: "A series of videos showcasing exploration of custom-built fantasy worlds",
    type: "video",
    createdAt: "2024-01-25T11:00:00Z",
    updatedAt: "2024-02-15T10:20:00Z",
    relatedProjects: ["3", "5", "7"]
  },
  {
    id: "7",
    title: "Enchanted Forest Ambience",
    description: "Ambient sound design for enchanted forest biomes with magical creature sounds",
    type: "audio",
    createdAt: "2024-02-18T14:45:00Z",
    updatedAt: "2024-03-05T12:10:00Z",
    relatedProjects: ["1", "6"]
  }
];

interface ProjectState {
  projects: Project[];
  selectedProject: Project | null;
  selectProject: (id: string | null) => void;
  clearSelectedProject: () => void;
  addProject: (project: Omit<Project, "id" | "createdAt" | "updatedAt">) => void;
  updateProject: (project: Project) => void;
  deleteProject: (id: string) => void;
}

export const useProjects = create<ProjectState>()(
  devtools(
    (set, get) => ({
      projects: initialProjects,
      selectedProject: null,
      
      selectProject: (id: string | null) => {
        if (id === null) {
          set({ selectedProject: null });
          return;
        }
        
        const { projects } = get();
        const project = projects.find(p => p.id === id) || null;
        set({ selectedProject: project });
      },
      
      clearSelectedProject: () => {
        set({ selectedProject: null });
      },
      
      addProject: (projectData) => {
        const project: Project = {
          ...projectData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        set(state => ({
          projects: [...state.projects, project],
          selectedProject: project
        }));
      },
      
      updateProject: (updatedProject) => {
        set(state => ({
          projects: state.projects.map(p => 
            p.id === updatedProject.id ? updatedProject : p
          ),
          selectedProject: updatedProject
        }));
      },
      
      deleteProject: (id: string) => {
        set(state => {
          // Remove the project
          const updatedProjects = state.projects.filter(p => p.id !== id);
          
          // Remove references to this project from related projects
          const cleanedProjects = updatedProjects.map(project => {
            if (project.relatedProjects && project.relatedProjects.includes(id)) {
              return {
                ...project,
                relatedProjects: project.relatedProjects.filter(relatedId => relatedId !== id)
              };
            }
            return project;
          });
          
          // Update selected project if it was deleted
          const newSelectedProject = 
            state.selectedProject?.id === id 
              ? null 
              : state.selectedProject;
          
          return {
            projects: cleanedProjects,
            selectedProject: newSelectedProject
          };
        });
      }
    }),
    { name: "projects-store" }
  )
);
