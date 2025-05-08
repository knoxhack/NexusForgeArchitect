import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  getAllProjects, 
  getProjectById, 
  createProject, 
  updateProject, 
  deleteProject 
} from "./controllers/projectController";
import {
  getAllPersonas,
  getPersonaById,
  getMessagesByPersona,
  createMessage
} from "./controllers/aiController";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes for projects
  app.get("/api/projects", getAllProjects);
  app.get("/api/projects/:id", getProjectById);
  app.post("/api/projects", createProject);
  app.put("/api/projects/:id", updateProject);
  app.delete("/api/projects/:id", deleteProject);
  
  // API routes for AI
  app.get("/api/ai/personas", getAllPersonas);
  app.get("/api/ai/personas/:id", getPersonaById);
  app.get("/api/ai/messages/:personaId", getMessagesByPersona);
  app.post("/api/ai/messages", createMessage);
  
  const httpServer = createServer(app);
  
  return httpServer;
}
