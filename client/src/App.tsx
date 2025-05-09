import React, { Suspense, useState, useEffect, lazy } from "react";
import { Canvas } from "@react-three/fiber";
import { Loader, KeyboardControls } from "@react-three/drei";
import { Toaster } from "sonner";
import { RefreshCw, Brain } from "lucide-react";
import { Button } from "./components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "./components/ui/dialog";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NotFound from "./pages/not-found";
import ThreeScene from "./components/ThreeScene";
import Navigation from "./components/Navigation";
import AIAssistant from "./components/AIAssistant";
import Timeline from "./components/Timeline";
import ProjectManager from "./components/ProjectManager";
import CreatorStats from "./components/CreatorStats";
import CreatorNeuralLayer from "./components/CreatorNeuralLayer";
import GodMode from "./components/GodMode";
import OnboardingTutorial from "./components/OnboardingTutorial";
import AccessibilitySettings from "./components/AccessibilitySettings";
import ContextualHelp from "./components/ContextualHelp";
import UserPreferences from "./components/UserPreferences";
import ShortcutGuide from "./components/ShortcutGuide";
import SystemStatus from "./components/SystemStatus";
import RealityFusion from "./components/RealityFusion";
import { UniverseSidebar } from "./components/UniverseSidebar";
import { WelcomeModal } from "./components/WelcomeModal";
import { useAudio } from "./lib/stores/useAudio";
import { useGame } from "./lib/stores/useGame";
import { useNeuralLayer } from "./lib/stores/useNeuralLayer";
import { useIsMobile } from "./hooks/use-is-mobile";
import { useNotifications } from "./lib/stores/useNotifications";
import "@fontsource/inter";

// Dynamically import GlobalSearch to prevent circular dependencies if there are any
const GlobalSearch = lazy(() => import("./components/GlobalSearch"));

// Define view types
type ViewType = "universe" | "timeline" | "assistant" | "stats";

// Define keyboard control map for navigation
const controls = [
  { name: "forward", keys: ["KeyW", "ArrowUp"] },
  { name: "backward", keys: ["KeyS", "ArrowDown"] },
  { name: "leftward", keys: ["KeyA", "ArrowLeft"] },
  { name: "rightward", keys: ["KeyD", "ArrowRight"] },
  { name: "zoom", keys: ["KeyQ"] },
  { name: "unzoom", keys: ["KeyE"] },
  { name: "select", keys: ["Space"] },
  { name: "menu", keys: ["KeyM"] },
  { name: "assistant", keys: ["KeyI"] },
  { name: "godmode", keys: ["KeyG"] }, // G key for GodMode
];

// Main App component
function App() {
  const [activeView, setActiveView] = useState<ViewType>("universe");
  const [showCanvas, setShowCanvas] = useState(false);
  const { phase } = useGame();
  const isMobile = useIsMobile();
  const { addNotification } = useNotifications();
  
  // Audio setup
  const { 
    setBackgroundMusic, 
    setHitSound, 
    setSuccessSound,
    setErrorSound,
    setNotificationSound, 
    startBackgroundMusic,
    isMuted,
    playNotification
  } = useAudio();
  
  // Load audio files
  useEffect(() => {
    // Only initialize audio when user has interacted with the page
    const handleInteraction = () => {
      const bgMusic = new Audio("/sounds/background.mp3");
      const hit = new Audio("/sounds/hit.mp3");
      const success = new Audio("/sounds/success.mp3");
      const error = new Audio("/sounds/error.mp3");
      const notification = new Audio("/sounds/notification.mp3");
      
      // Set up audio with our store functions
      setBackgroundMusic(bgMusic);
      setHitSound(hit);
      setSuccessSound(success);
      setErrorSound(error);
      setNotificationSound(notification);
      
      // Start background music automatically if not muted
      if (!isMuted) {
        startBackgroundMusic();
      }
      
      // Remove event listeners once audio is initialized
      document.removeEventListener("click", handleInteraction);
      document.removeEventListener("keydown", handleInteraction);
    };
    
    document.addEventListener("click", handleInteraction);
    document.addEventListener("keydown", handleInteraction);
    
    return () => {
      document.removeEventListener("click", handleInteraction);
      document.removeEventListener("keydown", handleInteraction);
    };
  }, [setBackgroundMusic, setHitSound, setSuccessSound, setErrorSound, setNotificationSound, startBackgroundMusic, isMuted]);
  
  // Show the canvas once everything is loaded
  useEffect(() => {
    setShowCanvas(true);
    
    // Add welcome notification after a short delay
    const timer = setTimeout(() => {
      // Welcome notification
      addNotification({
        title: "Welcome to NEXUSFORGE OS",
        message: "System initialized. Access God Mode for advanced features and system monitoring.",
        type: "info",
        priority: "medium",
        source: "System Core"
      });
      
      // Tutorial notification
      setTimeout(() => {
        addNotification({
          title: "Navigation Tutorial",
          message: "Use the navigation controls to explore the universe. Switch views using the top menu.",
          type: "success",
          priority: "low",
          source: "Tutorial System"
        });
      }, 5000);
      
      // GodMode activation hint
      setTimeout(() => {
        addNotification({
          title: "God Mode Access",
          message: "Press 'G' key to toggle God Mode for system monitoring and advanced controls.",
          type: "info",
          priority: "medium",
          source: "System Core"
        });
      }, 10000);
      
      // Reality Fusion Lab hint
      setTimeout(() => {
        addNotification({
          title: "Reality Fusion Lab Available",
          message: "Access the Reality Fusion Lab to combine different forms of data across realities.",
          type: "success",
          priority: "high",
          source: "Reality Core"
        });
      }, 15000);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [addNotification]);
  
  // Keyboard controls are handled in the GodMode component
  
  return (
    <Router>
      <div className="relative w-full h-full bg-background text-foreground overflow-hidden">
        <Toaster position="top-right" richColors closeButton />
        
        <Routes>
          <Route
            path="/"
            element={
              <div className="w-full h-full relative">
                <Navigation 
                  activeView={activeView} 
                  setActiveView={setActiveView} 
                />
                
                {/* Main 3D Canvas */}
                {showCanvas && (
                  <KeyboardControls map={controls}>
                    <div className="w-full h-full">
                      <Canvas
                        className="w-full h-full"
                        camera={{
                          position: [0, 10, 20],
                          fov: 60,
                          near: 0.1,
                          far: 1000
                        }}
                        gl={{
                          antialias: true,
                          powerPreference: "high-performance"
                        }}
                      >
                        <color attach="background" args={["#050510"]} />
                        <Suspense fallback={null}>
                          <ThreeScene activeView={activeView} />
                        </Suspense>
                      </Canvas>
                      
                      <Loader />
                      
                      {/* Mobile Touch Controls Hint */}
                      {isMobile && activeView === "universe" && (
                        <div className="absolute bottom-16 left-0 right-0 flex justify-center z-50 pointer-events-none">
                          <div className="bg-black/60 text-white/90 text-xs px-3 py-1 rounded-full">
                            Drag to navigate • Pinch to zoom
                          </div>
                        </div>
                      )}
                      
                      {/* UI Overlays */}
                      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                        {activeView === "universe" && (
                          <div className="pointer-events-auto">
                            <ProjectManager />
                          </div>
                        )}
                        
                        {activeView === "timeline" && (
                          <div className="pointer-events-auto">
                            <Timeline />
                          </div>
                        )}
                        
                        {activeView === "assistant" && (
                          <div className="pointer-events-auto">
                            <AIAssistant />
                          </div>
                        )}
                        
                        {activeView === "stats" && (
                          <div className="pointer-events-auto">
                            <CreatorStats />
                          </div>
                        )}
                      </div>
                    </div>
                  </KeyboardControls>
                )}
                
                {/* God Mode Features */}
                <GodMode />
                
                {/* Onboarding Tutorial */}
                <OnboardingTutorial />
                
                {/* Accessibility Settings */}
                <AccessibilitySettings />
                
                {/* Contextual Help System */}
                <ContextualHelp />
                
                {/* User Preferences */}
                <UserPreferences />
                
                {/* Keyboard Shortcut Guide */}
                <ShortcutGuide />
                
                {/* System Status */}
                <SystemStatus />
                
                {/* Global Search */}
                <Suspense fallback={<div>Loading search...</div>}>
                  <GlobalSearch />
                </Suspense>
                
                {/* Universe Sidebar for selected nodes/projects */}
                {activeView === "universe" && <UniverseSidebar />}
                
                {/* Reality Fusion Lab */}
                <div className="fixed bottom-4 right-4 z-50">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        className="rounded-full shadow-lg flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                        onClick={() => playNotification()}
                      >
                        <RefreshCw className="h-4 w-4" />
                        <span>Reality Fusion Lab</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-5xl h-[80vh] p-0">
                      <RealityFusion />
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Welcome Modal */}
                <WelcomeModal />
              </div>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
