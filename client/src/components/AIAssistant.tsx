import React, { useState, useRef, useEffect } from "react";
import { useAIAssistant } from "@/lib/stores/useAIAssistant";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Avatar } from "./ui/avatar";
import { Card } from "./ui/card";
import { useGame } from "@/lib/stores/useGame";
import { useAudio } from "@/lib/stores/useAudio";
import { AI_Message } from "@shared/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Input } from "./ui/input";
import { apiRequest } from "@/lib/queryClient";

const AIAssistant: React.FC = () => {
  const { 
    aiPersonas,
    activePersona,
    setActivePersona,
    messages,
    addMessage
  } = useAIAssistant();
  
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { playHit, playSuccess } = useAudio();
  
  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  // Handle sending a message
  const handleSendMessage = async () => {
    if (!input.trim() || !activePersona) return;
    
    // Play sound
    playHit();
    
    // Add user message to conversation
    const userMessage: AI_Message = {
      id: Date.now().toString(),
      content: input,
      role: "user",
      timestamp: new Date().toISOString()
    };
    
    addMessage(userMessage);
    setInput("");
    setIsTyping(true);
    
    try {
      // Simulate AI response (in a real application, this would call the backend)
      setTimeout(async () => {
        // In a real implementation, we would call the backend API
        // const response = await apiRequest("POST", "/api/ai/message", {
        //   message: input,
        //   personaId: activePersona.id
        // });
        // const data = await response.json();
        
        // For now, we'll simulate a response
        const aiResponse: AI_Message = {
          id: (Date.now() + 1).toString(),
          content: generateAIResponse(input, activePersona.name),
          role: "assistant",
          timestamp: new Date().toISOString()
        };
        
        addMessage(aiResponse);
        setIsTyping(false);
        playSuccess();
      }, 1500);
    } catch (error) {
      console.error("Failed to get AI response:", error);
      setIsTyping(false);
    }
  };
  
  // Helper to generate fake AI responses
  const generateAIResponse = (message: string, personaName: string): string => {
    let response = "";
    
    switch (personaName) {
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
  };
  
  return (
    <div className="absolute inset-0 w-full h-full bg-black/50 backdrop-blur-sm p-6 overflow-hidden flex flex-col">
      <div className="max-w-5xl mx-auto w-full h-full flex flex-col">
        <h2 className="text-4xl font-bold text-cyan-400 mb-2">Nexi: Quantum Clone System</h2>
        <p className="text-gray-300 mb-6">
          Your AI assistant system with specialized personalities for different creative tasks
        </p>
        
        <div className="flex-1 flex gap-6 overflow-hidden">
          {/* AI Personas sidebar */}
          <div className="w-48 flex-shrink-0 bg-black/60 rounded-lg p-4 border border-gray-700">
            <h3 className="text-white font-bold mb-4">AI Personas</h3>
            <div className="space-y-3">
              {aiPersonas.map(persona => (
                <Button 
                  key={persona.id}
                  variant="ghost"
                  className={`w-full justify-start ${activePersona?.id === persona.id ? "bg-gray-800" : ""}`}
                  onClick={() => {
                    setActivePersona(persona.id);
                    playHit();
                  }}
                >
                  <div 
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: persona.color }}
                  ></div>
                  <span>{persona.name}</span>
                </Button>
              ))}
            </div>
          </div>
          
          {/* Main chat area */}
          <div className="flex-1 flex flex-col overflow-hidden bg-black/60 rounded-lg border border-gray-700">
            {activePersona ? (
              <>
                {/* Persona header */}
                <div className="p-4 border-b border-gray-700 flex items-center">
                  <div 
                    className="w-8 h-8 rounded-full mr-3"
                    style={{ backgroundColor: activePersona.color }}
                  ></div>
                  <div>
                    <h3 className="text-white font-bold">{activePersona.name}</h3>
                    <p className="text-gray-400 text-sm">{activePersona.description}</p>
                  </div>
                </div>
                
                {/* Messages area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.filter(msg => 
                    msg.personaId === undefined || msg.personaId === activePersona.id
                  ).map(message => (
                    <div 
                      key={message.id} 
                      className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div 
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.role === "user" 
                            ? "bg-cyan-800 text-white" 
                            : "bg-gray-800 text-white"
                        }`}
                      >
                        {message.content}
                        <div className="text-xs opacity-60 mt-1">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="max-w-[80%] rounded-lg p-3 bg-gray-800 text-white">
                        <div className="flex space-x-2">
                          <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse"></div>
                          <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" style={{ animationDelay: "0.2s" }}></div>
                          <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" style={{ animationDelay: "0.4s" }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
                
                {/* Input area */}
                <div className="p-4 border-t border-gray-700">
                  <div className="flex gap-2">
                    <Textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder={`Ask ${activePersona.name} anything...`}
                      className="resize-none bg-gray-900"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <Button 
                      onClick={handleSendMessage}
                      className="bg-cyan-600 hover:bg-cyan-700"
                      disabled={isTyping || !input.trim()}
                    >
                      Send
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-cyan-800 mb-4 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Select an AI Persona</h3>
                <p className="text-gray-400">
                  Choose one of the specialized AI personas from the sidebar to begin your conversation
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
