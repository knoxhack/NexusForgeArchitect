import { Request, Response } from "express";
import { storage } from "../storage";
import { Project } from "@shared/types";

// In-memory storage for projects (would be replaced with database in production)
let projects: Project[] = [
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
  }
];

// Get all projects
export const getAllProjects = (req: Request, res: Response) => {
  res.json(projects);
};

// Get project by ID
export const getProjectById = (req: Request, res: Response) => {
  const { id } = req.params;
  const project = projects.find(p => p.id === id);
  
  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }
  
  res.json(project);
};

// Create new project
export const createProject = (req: Request, res: Response) => {
  const { title, description, type, relatedProjects } = req.body;
  
  if (!title || !description || !type) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  
  const newProject: Project = {
    id: Date.now().toString(),
    title,
    description,
    type,
    relatedProjects: relatedProjects || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  projects.push(newProject);
  res.status(201).json(newProject);
};

// Update project
export const updateProject = (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, description, type, relatedProjects } = req.body;
  
  const projectIndex = projects.findIndex(p => p.id === id);
  
  if (projectIndex === -1) {
    return res.status(404).json({ message: "Project not found" });
  }
  
  const updatedProject: Project = {
    ...projects[projectIndex],
    title: title || projects[projectIndex].title,
    description: description || projects[projectIndex].description,
    type: type || projects[projectIndex].type,
    relatedProjects: relatedProjects || projects[projectIndex].relatedProjects,
    updatedAt: new Date().toISOString()
  };
  
  projects[projectIndex] = updatedProject;
  res.json(updatedProject);
};

// Delete project
export const deleteProject = (req: Request, res: Response) => {
  const { id } = req.params;
  
  const projectIndex = projects.findIndex(p => p.id === id);
  
  if (projectIndex === -1) {
    return res.status(404).json({ message: "Project not found" });
  }
  
  // Remove the project
  const deletedProject = projects[projectIndex];
  projects.splice(projectIndex, 1);
  
  // Remove references to this project from related projects
  projects = projects.map(project => {
    if (project.relatedProjects && project.relatedProjects.includes(id)) {
      return {
        ...project,
        relatedProjects: project.relatedProjects.filter(relatedId => relatedId !== id),
        updatedAt: new Date().toISOString()
      };
    }
    return project;
  });
  
  res.json({ message: "Project deleted", project: deletedProject });
};
