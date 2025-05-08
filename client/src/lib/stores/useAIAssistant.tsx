import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { AI_Message, AI_Persona } from "@shared/types";

// Initial AI personas
const initialPersonas: AI_Persona[] = [
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

// Initial messages
const initialMessages: AI_Message[] = [
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
  },
  {
    id: "msg4",
    content: "Greetings visionary, I'm VidDrift. Ready to transform your ideas into compelling visual narratives.",
    role: "assistant",
    timestamp: "2024-02-10T14:30:00Z",
    personaId: "2"
  }
];

interface AIAssistantState {
  aiPersonas: AI_Persona[];
  activePersona: AI_Persona | null;
  messages: AI_Message[];
  
  setActivePersona: (id: string) => void;
  addMessage: (message: AI_Message) => void;
  clearMessages: (personaId?: string) => void;
}

export const useAIAssistant = create<AIAssistantState>()(
  devtools(
    (set, get) => ({
      aiPersonas: initialPersonas,
      activePersona: null,
      messages: initialMessages,
      
      setActivePersona: (id: string) => {
        const { aiPersonas } = get();
        const persona = aiPersonas.find(p => p.id === id) || null;
        set({ activePersona: persona });
      },
      
      addMessage: (message: AI_Message) => {
        const { activePersona } = get();
        
        // If no personaId is provided, use the active persona
        const updatedMessage = {
          ...message,
          personaId: message.personaId || activePersona?.id
        };
        
        set(state => ({
          messages: [...state.messages, updatedMessage]
        }));
      },
      
      clearMessages: (personaId?: string) => {
        if (personaId) {
          // Clear messages for a specific persona
          set(state => ({
            messages: state.messages.filter(m => m.personaId !== personaId)
          }));
        } else {
          // Clear all messages
          set({ messages: [] });
        }
      }
    }),
    { name: "ai-assistant-store" }
  )
);
