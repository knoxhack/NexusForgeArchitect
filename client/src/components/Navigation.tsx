import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAudio } from "@/lib/stores/useAudio";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { useKeyboardControls } from "@react-three/drei";
import { useIsMobile } from "@/hooks/use-is-mobile";

interface NavigationProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeView, setActiveView }) => {
  const [showHelp, setShowHelp] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { isMuted, toggleMute, backgroundMusic } = useAudio();
  const isMobile = useIsMobile();
  
  // Define a type-safe way to access keyboard controls
  const getControls = () => {
    try {
      // Since our controls in App.tsx include 'menu' and 'assistant'
      return {
        menu: useKeyboardControls((state: any) => state.menu),
        assistant: useKeyboardControls((state: any) => state.assistant)
      };
    } catch (error) {
      console.log("Keyboard controls not fully initialized yet", error);
      return { menu: false, assistant: false };
    }
  };
  
  const { menu, assistant } = getControls();
  
  // Handle keyboard navigation
  useEffect(() => {
    if (menu) {
      // Toggle between universe and timeline views
      setActiveView(prev => prev === "universe" ? "timeline" : "universe");
    }
    
    if (assistant) {
      // Toggle between assistant and stats views
      setActiveView(prev => prev === "assistant" ? "stats" : "assistant");
    }
  }, [menu, assistant, setActiveView]);
  
  // Play background music
  useEffect(() => {
    if (backgroundMusic && !isMuted) {
      backgroundMusic.play().catch(error => {
        console.log("Music play prevented:", error);
      });
    }
  }, [backgroundMusic, isMuted]);
  
  // Close mobile menu when view changes
  useEffect(() => {
    setShowMobileMenu(false);
  }, [activeView]);
  
  return (
    <>
      {/* Top navigation bar */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-black/60 backdrop-blur-sm border-b border-gray-700 z-10 flex items-center justify-between px-4 md:px-6">
        <div className="flex items-center">
          <h1 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-cyan-400 ${isMobile ? 'mr-2' : 'mr-8'}`}>NEXUSFORGE OS</h1>
          
          {/* Desktop navigation */}
          {!isMobile && (
            <div className="flex space-x-4">
              <Button
                variant="ghost"
                className={cn(
                  "text-gray-300 hover:text-white hover:bg-gray-800", 
                  activeView === "universe" && "bg-gray-800 text-white"
                )}
                onClick={() => setActiveView("universe")}
              >
                Multiversal Grid
              </Button>
              
              <Button
                variant="ghost"
                className={cn(
                  "text-gray-300 hover:text-white hover:bg-gray-800", 
                  activeView === "timeline" && "bg-gray-800 text-white"
                )}
                onClick={() => setActiveView("timeline")}
              >
                ChronoWeave Timeline
              </Button>
              
              <Button
                variant="ghost"
                className={cn(
                  "text-gray-300 hover:text-white hover:bg-gray-800", 
                  activeView === "assistant" && "bg-gray-800 text-white"
                )}
                onClick={() => setActiveView("assistant")}
              >
                Nexi AI
              </Button>
              
              <Button
                variant="ghost"
                className={cn(
                  "text-gray-300 hover:text-white hover:bg-gray-800", 
                  activeView === "stats" && "bg-gray-800 text-white"
                )}
                onClick={() => setActiveView("stats")}
              >
                Creator Stats
              </Button>
            </div>
          )}
          
          {/* Mobile menu button */}
          {isMobile && (
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-300 hover:text-white hover:bg-gray-800"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Button>
          )}
        </div>
        
        <div className="flex items-center space-x-2 md:space-x-4">
          <Button
            variant="ghost"
            size={isMobile ? "sm" : "default"}
            className="text-gray-300 hover:text-white hover:bg-gray-800"
            onClick={toggleMute}
          >
            {isMuted ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            )}
          </Button>
          
          <Button
            variant="ghost"
            size={isMobile ? "sm" : "default"}
            className="text-gray-300 hover:text-white hover:bg-gray-800"
            onClick={() => setShowHelp(true)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </Button>
        </div>
      </div>
      
      {/* Mobile menu dropdown */}
      {isMobile && showMobileMenu && (
        <div className="absolute top-16 left-0 right-0 bg-black/80 backdrop-blur-md z-20 border-b border-gray-700">
          <div className="flex flex-col p-2">
            <Button
              variant="ghost"
              className={cn(
                "text-gray-300 hover:text-white hover:bg-gray-800 justify-start mb-1", 
                activeView === "universe" && "bg-gray-800 text-white"
              )}
              onClick={() => setActiveView("universe")}
            >
              Multiversal Grid
            </Button>
            
            <Button
              variant="ghost"
              className={cn(
                "text-gray-300 hover:text-white hover:bg-gray-800 justify-start mb-1", 
                activeView === "timeline" && "bg-gray-800 text-white"
              )}
              onClick={() => setActiveView("timeline")}
            >
              ChronoWeave Timeline
            </Button>
            
            <Button
              variant="ghost"
              className={cn(
                "text-gray-300 hover:text-white hover:bg-gray-800 justify-start mb-1", 
                activeView === "assistant" && "bg-gray-800 text-white"
              )}
              onClick={() => setActiveView("assistant")}
            >
              Nexi AI
            </Button>
            
            <Button
              variant="ghost"
              className={cn(
                "text-gray-300 hover:text-white hover:bg-gray-800 justify-start", 
                activeView === "stats" && "bg-gray-800 text-white"
              )}
              onClick={() => setActiveView("stats")}
            >
              Creator Stats
            </Button>
          </div>
        </div>
      )}
      
      {/* Help dialog */}
      <Dialog open={showHelp} onOpenChange={setShowHelp}>
        <DialogContent className="bg-gray-900 text-white border-gray-700 max-w-lg w-[90vw] rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-xl text-cyan-400">NEXUSFORGE OS: Controls & Help</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {!isMobile && (
              <div>
                <h3 className="font-bold text-white mb-2">Keyboard Controls</h3>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex justify-between">
                    <span>W / Arrow Up</span>
                    <span className="text-cyan-300">Move Forward</span>
                  </li>
                  <li className="flex justify-between">
                    <span>S / Arrow Down</span>
                    <span className="text-cyan-300">Move Backward</span>
                  </li>
                  <li className="flex justify-between">
                    <span>A / Arrow Left</span>
                    <span className="text-cyan-300">Move Left</span>
                  </li>
                  <li className="flex justify-between">
                    <span>D / Arrow Right</span>
                    <span className="text-cyan-300">Move Right</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Q</span>
                    <span className="text-cyan-300">Zoom In</span>
                  </li>
                  <li className="flex justify-between">
                    <span>E</span>
                    <span className="text-cyan-300">Zoom Out</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Space</span>
                    <span className="text-cyan-300">Select</span>
                  </li>
                  <li className="flex justify-between">
                    <span>M</span>
                    <span className="text-cyan-300">Toggle Grid/Timeline</span>
                  </li>
                  <li className="flex justify-between">
                    <span>I</span>
                    <span className="text-cyan-300">Toggle AI/Stats</span>
                  </li>
                </ul>
              </div>
            )}
            
            {isMobile && (
              <div>
                <h3 className="font-bold text-white mb-2">Touch Controls</h3>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex justify-between">
                    <span>Drag</span>
                    <span className="text-cyan-300">Move Around</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Pinch</span>
                    <span className="text-cyan-300">Zoom In/Out</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Tap</span>
                    <span className="text-cyan-300">Select Object</span>
                  </li>
                </ul>
              </div>
            )}
            
            <div>
              <h3 className="font-bold text-white mb-2">View Descriptions</h3>
              <ul className="space-y-2 text-gray-300">
                <li className="mb-2">
                  <span className="text-cyan-300 font-bold">Multiversal Grid:</span> 
                  <p>3D visualization of all your projects as interconnected nodes in a universe</p>
                </li>
                <li className="mb-2">
                  <span className="text-cyan-300 font-bold">ChronoWeave Timeline:</span> 
                  <p>Chronological visualization of your projects and how they influence each other</p>
                </li>
                <li className="mb-2">
                  <span className="text-cyan-300 font-bold">Nexi AI:</span> 
                  <p>Specialized AI assistants to help with different aspects of your creative work</p>
                </li>
                <li className="mb-2">
                  <span className="text-cyan-300 font-bold">Creator Stats:</span> 
                  <p>Analytics and insights about your creative output and patterns</p>
                </li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Navigation;
