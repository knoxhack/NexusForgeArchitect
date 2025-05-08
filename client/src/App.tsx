import { Suspense, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { Loader, KeyboardControls } from "@react-three/drei";
import { Toaster } from "sonner";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NotFound from "./pages/not-found";
import ThreeScene from "./components/ThreeScene";
import Navigation from "./components/Navigation";
import AIAssistant from "./components/AIAssistant";
import Timeline from "./components/Timeline";
import ProjectManager from "./components/ProjectManager";
import CreatorStats from "./components/CreatorStats";
import { useAudio } from "./lib/stores/useAudio";
import { useGame } from "./lib/stores/useGame";
import { useIsMobile } from "./hooks/use-is-mobile";
import "@fontsource/inter";

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
];

// Main App component
function App() {
  const [activeView, setActiveView] = useState<string>("universe");
  const [showCanvas, setShowCanvas] = useState(false);
  const { phase } = useGame();
  const isMobile = useIsMobile();
  
  // Audio setup
  const { setBackgroundMusic, setHitSound, setSuccessSound } = useAudio();
  
  // Load audio files
  useEffect(() => {
    // Only initialize audio when user has interacted with the page
    const handleInteraction = () => {
      const bgMusic = new Audio("/sounds/background.mp3");
      bgMusic.loop = true;
      bgMusic.volume = 0.3;
      
      const hit = new Audio("/sounds/hit.mp3");
      const success = new Audio("/sounds/success.mp3");
      
      setBackgroundMusic(bgMusic);
      setHitSound(hit);
      setSuccessSound(success);
      
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
  }, [setBackgroundMusic, setHitSound, setSuccessSound]);
  
  // Show the canvas once everything is loaded
  useEffect(() => {
    setShowCanvas(true);
  }, []);
  
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
