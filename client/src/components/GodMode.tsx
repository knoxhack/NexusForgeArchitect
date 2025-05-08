import React, { useEffect, useState, useCallback } from "react";
import { useGame } from "@/lib/stores/useGame";
import { useAudio } from "@/lib/stores/useAudio";
import { useProjects } from "@/lib/stores/useProjects";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Mic, BarChart3, Database, Cpu } from "lucide-react";

// Component for advanced "God Mode" features
// This includes voice commands, advanced visualizations, and analytics
const GodMode: React.FC = () => {
  const { viewMode, setViewMode, recordInteraction, interactionCount } = useGame();
  const { playSuccess } = useAudio();
  const { projects } = useProjects();
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [stats, setStats] = useState({
    cpu: 0,
    gpu: 0,
    memory: 0,
    fps: 0,
    connections: 0,
    sessions: 0,
    uptime: 0
  });
  
  // Calculate system metrics - simulated for the UI
  useEffect(() => {
    if (viewMode !== "godmode") return;
    
    // Simulate system metrics with dynamic values
    const interval = setInterval(() => {
      setStats({
        cpu: Math.floor(85 + Math.random() * 15),
        gpu: Math.floor(75 + Math.random() * 25),
        memory: parseFloat((3.8 + Math.random() * 0.8).toFixed(1)),
        fps: Math.floor(55 + Math.random() * 10),
        connections: projects.length * 2 + Math.floor(Math.random() * 10),
        sessions: Math.floor(3 + Math.random() * 5),
        uptime: Math.floor(Date.now() / (1000 * 60)) % (60 * 24) // Minutes since epoch % day
      });
    }, 2000);
    
    return () => clearInterval(interval);
  }, [viewMode, projects.length]);
  
  // Check if browser supports speech recognition
  const speechRecognitionSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  
  // Voice command activation handler
  const toggleVoiceCommands = () => {
    if (!speechRecognitionSupported) {
      toast.error("Voice commands not supported in your browser");
      return;
    }
    
    // Toggle listening state
    setListening(!listening);
    recordInteraction();
  };
  
  // Simulate voice command processing
  useEffect(() => {
    if (!listening) return;
    
    // Show toast to indicate listening started
    toast.info("Listening for commands...", {
      position: "top-center",
      duration: 3000,
    });
    
    // Simulate a timeout for processing
    const timeout = setTimeout(() => {
      // Simulate a successful command
      setTranscript("Activate God Mode");
      playSuccess();
      
      // Apply the mode change
      if (viewMode !== "godmode") {
        setViewMode("godmode");
        toast.success("God Mode activated", {
          description: "Advanced visualization and analytics enabled",
          duration: 4000,
        });
      }
      
      // Stop listening after command processed
      setListening(false);
    }, 2000);
    
    return () => clearTimeout(timeout);
  }, [listening, playSuccess, setViewMode, viewMode]);
  
  return (
    <div className="fixed bottom-16 right-4 z-50">
      <div className="relative">
        <button
          onClick={toggleVoiceCommands}
          className={`p-3 rounded-full shadow-lg transition-all duration-300 ${
            listening 
              ? "bg-red-500 text-white pulse-animation" 
              : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
          }`}
          title={speechRecognitionSupported ? "Activate voice commands" : "Voice commands not supported"}
          disabled={!speechRecognitionSupported}
        >
          <Mic className="h-5 w-5" />
        </button>
        
        {transcript && (
          <div className="absolute bottom-full right-0 mb-2 whitespace-nowrap">
            <Badge variant="secondary" className="bg-black/50 text-white px-3">
              "{transcript}"
            </Badge>
          </div>
        )}
      </div>
      
      {/* Conditional rendering for God Mode UI overlays */}
      {viewMode === "godmode" && (
        <div className="fixed inset-0 pointer-events-none">
          {/* Top header with system status */}
          <div className="absolute top-20 left-4 right-4 bg-black/30 p-2 rounded-md backdrop-blur-sm text-white text-xs border border-cyan-500/30 pointer-events-auto">
            <div 
              className="text-center text-cyan-400 font-bold mb-1 cursor-pointer hover:text-cyan-300"
              onClick={(e) => {
                e.stopPropagation();
                toast.success("NEXUSFORGE OS: 2.0.5-GodMode", {
                  description: "All systems operational. Reality fusion at 100%.",
                  duration: 5000
                });
                playSuccess();
              }}
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 to-blue-500">
                NEXUSFORGE OS: GOD MODE
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1 text-center">
              <div 
                className="flex flex-col items-center p-1 rounded hover:bg-black/20 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  const status = stats.cpu > 90 ? "Critical" : stats.cpu > 75 ? "High" : "Normal";
                  toast.info(`CPU load: ${status} (${stats.cpu}%)`);
                }}
              >
                <span className="flex items-center gap-1">
                  <Cpu className="h-3 w-3" />
                  <span>CPU</span>
                </span>
                <span className={`${stats.cpu > 90 ? 'text-red-400' : 'text-green-400'}`}>
                  {stats.cpu}%
                </span>
              </div>
              <div 
                className="flex flex-col items-center p-1 rounded hover:bg-black/20 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  const status = stats.gpu > 90 ? "Critical" : stats.gpu > 75 ? "High" : "Normal";
                  toast.info(`GPU load: ${status} (${stats.gpu}%)`);
                }}
              >
                <span>GPU</span>
                <span className={`${stats.gpu > 90 ? 'text-red-400' : 'text-yellow-400'}`}>
                  {stats.gpu}%
                </span>
              </div>
              <div 
                className="flex flex-col items-center p-1 rounded hover:bg-black/20 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  toast.info(`Memory usage: ${stats.memory}GB / 8GB`);
                }}
              >
                <span className="flex items-center gap-1">
                  <Database className="h-3 w-3" />
                  <span>MEM</span>
                </span>
                <span className="text-blue-400">
                  {stats.memory}GB
                </span>
              </div>
              <div 
                className="flex flex-col items-center p-1 rounded hover:bg-black/20 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  const status = stats.fps < 30 ? "Low" : stats.fps < 45 ? "Medium" : "High";
                  toast.info(`Framerate: ${status} (${stats.fps} FPS)`);
                  playSuccess();
                }}
              >
                <span className="flex items-center gap-1">
                  <BarChart3 className="h-3 w-3" />
                  <span>FPS</span>
                </span>
                <span className={`${stats.fps < 30 ? 'text-red-400' : 'text-purple-400'}`}>
                  {stats.fps}
                </span>
              </div>
            </div>
          </div>
          
          {/* Left side vertical metrics panel */}
          <div className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 p-2 rounded-md backdrop-blur-sm text-white text-xs border border-cyan-500/30 pointer-events-auto">
            <div className="mb-2 text-cyan-400 font-bold text-center">METRICS</div>
            <div className="space-y-2">
              <div 
                className="flex justify-between gap-3 hover:bg-black/20 p-1 rounded cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  toast.info(`${projects.length} projects in database`);
                }}
              >
                <span>Projects:</span>
                <span className="text-green-400">{projects.length}</span>
              </div>
              <div 
                className="flex justify-between gap-3 hover:bg-black/20 p-1 rounded cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  toast.info(`${stats.connections} neural network connections mapped`);
                }}
              >
                <span>Connections:</span>
                <span className="text-green-400">{stats.connections}</span>
              </div>
              <div 
                className="flex justify-between gap-3 hover:bg-black/20 p-1 rounded cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  toast.info(`${stats.sessions} active creator sessions`);
                }}
              >
                <span>Sessions:</span>
                <span className="text-green-400">{stats.sessions}</span>
              </div>
              <div 
                className="flex justify-between gap-3 hover:bg-black/20 p-1 rounded cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  toast.info(`System uptime: ${Math.floor(stats.uptime / 60)}h ${stats.uptime % 60}m`);
                }}
              >
                <span>Uptime:</span>
                <span className="text-green-400">
                  {Math.floor(stats.uptime / 60)}h {stats.uptime % 60}m
                </span>
              </div>
              <div 
                className="flex justify-between gap-3 hover:bg-black/20 p-1 rounded cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  toast.info(`${interactionCount} total user interactions recorded`);
                  playSuccess();
                }}
              >
                <span>Interactions:</span>
                <span className="text-cyan-400">{interactionCount}</span>
              </div>
            </div>
          </div>
          
          {/* Bottom command center - with pointer-events-auto to make buttons clickable */}
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-black/40 p-2 rounded-md backdrop-blur-md text-white text-xs border border-cyan-500/50 w-72 max-w-full pointer-events-auto">
            <div className="grid grid-cols-3 gap-1 text-center">
              <div 
                className="bg-black/30 p-1 rounded cursor-pointer pulse-animation hover:bg-black/50"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent event bubbling
                  playSuccess();
                  toast.info("Scanning universe for anomalies...");
                  recordInteraction();
                }}
              >
                SCAN
              </div>
              <div 
                className="bg-black/30 p-1 rounded cursor-pointer hover:bg-black/50"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent event bubbling
                  playSuccess();
                  toast.success("Build mode activated");
                  recordInteraction();
                }}
              >
                BUILD
              </div>
              <div 
                className="bg-black/30 p-1 rounded cursor-pointer hover:bg-black/50"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent event bubbling
                  playSuccess();
                  toast.success("Neural pathways extended");
                  recordInteraction();
                }}
              >
                EXTEND
              </div>
            </div>
            <div className="mt-1 text-center text-green-400 text-[10px]">
              COMMAND CENTER INITIALIZED • {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GodMode;