import { Request, Response } from "express";
import { AI_Message, AI_Persona } from "@shared/types";

// In-memory storage for AI personas and messages
const aiPersonas: AI_Persona[] = [
  {
    id: "1",
    name: "CodeCore",
    description: "Specializes in code structures and technical solutions",
    color: "#4a9df0"
  },
  {
    id: "2",
    name: "VidDrift",
    description: "Cinematic video scene director and visual design expert",
    color: "#f04a4a"
  },
  {
    id: "3",
    name: "BrandGhost",
    description: "Builds brands, voice, bios and marketing plans",
    color: "#a64af0"
  },
  {
    id: "4",
    name: "Oracle",
    description: "Reflects on your work and provides creative guidance",
    color: "#f0e54a"
  },
  {
    id: "5",
    name: "Chaos",
    description: "Wild idea generator for creative 'glitches' and viral content",
    color: "#f07b4a"
  }
];

const messages: AI_Message[] = [
  {
    id: "msg1",
    content: "Hello creator, I'm CodeCore. How can I assist with your technical needs today?",
    role: "assistant",
    timestamp: "2024-01-15T10:00:00Z",
    personaId: "1"
  },
  {
    id: "msg2",
    content: "I'm looking for help structuring my new mod project.",
    role: "user",
    timestamp: "2024-01-15T10:01:15Z",
    personaId: "1"
  },
  {
    id: "msg3",
    content: "I recommend setting up your mod with a clear package structure. Start with separate packages for blocks, items, entities, and world generation. Would you like me to outline a specific structure?",
    role: "assistant",
    timestamp: "2024-01-15T10:01:45Z",
    personaId: "1"
  }
];

// Get all AI personas
export const getAllPersonas = (req: Request, res: Response) => {
  res.json(aiPersonas);
};

// Get persona by ID
export const getPersonaById = (req: Request, res: Response) => {
  const { id } = req.params;
  const persona = aiPersonas.find(p => p.id === id);
  
  if (!persona) {
    return res.status(404).json({ message: "AI Persona not found" });
  }
  
  res.json(persona);
};

// Get messages for a specific persona
export const getMessagesByPersona = (req: Request, res: Response) => {
  const { personaId } = req.params;
  const personaMessages = messages.filter(m => m.personaId === personaId);
  
  res.json(personaMessages);
};

// Create a new message
export const createMessage = (req: Request, res: Response) => {
  const { content, personaId } = req.body;
  
  if (!content || !personaId) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  
  // Create user message
  const userMessage: AI_Message = {
    id: Date.now().toString(),
    content,
    role: "user",
    timestamp: new Date().toISOString(),
    personaId
  };
  
  messages.push(userMessage);
  
  // Generate AI response (in a real app, this would use an actual AI service)
  const aiResponse = generateAIResponse(content, personaId);
  
  const aiMessage: AI_Message = {
    id: (Date.now() + 1).toString(),
    content: aiResponse,
    role: "assistant",
    timestamp: new Date(Date.now() + 1000).toISOString(),
    personaId
  };
  
  messages.push(aiMessage);
  
  res.status(201).json({ 
    userMessage, 
    aiMessage 
  });
};

// Helper function to generate AI responses
function generateAIResponse(message: string, personaId: string): string {
  const persona = aiPersonas.find(p => p.id === personaId);
  
  if (!persona) {
    return "I'm sorry, I couldn't process your request.";
  }
  
  let response = "";
  
  switch (persona.name) {
    case "CodeCore":
      response = `I've analyzed your request: "${message}". Here's a code solution that could help with your project structure. Let me know if you need any adjustments.`;
      break;
    case "VidDrift":
      response = `Creative direction for "${message}": I suggest a cinematic approach with dynamic transitions and atmospheric lighting. This would enhance the visual storytelling.`;
      break;
    case "BrandGhost":
      response = `For "${message}", consider positioning your brand voice as innovative yet accessible. This will resonate well with your target audience and increase engagement.`;
      break;
    case "Oracle":
      response = `I sense from your journal entries that "${message}" connects to your creative patterns from last month. Consider exploring this further to unlock new ideas.`;
      break;
    case "Chaos":
      response = `WILD IDEA INCOMING: What if "${message}" but with unexpected spatial distortion and timeline fracturing? Break conventional patterns for viral potential!`;
      break;
    default:
      response = `I've processed your request: "${message}". How would you like to proceed with this project?`;
  }
  
  return response;
}
