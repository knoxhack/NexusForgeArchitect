import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { useGame } from "@/lib/stores/useGame";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Separator } from "./ui/separator";
import { CheckCircle2, Lightbulb, Lock, Rocket, Sparkles, Star } from "lucide-react";
import { useAudio } from "@/lib/stores/useAudio";

export function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const { tutorialCompleted, completeTutorial } = useGame();
  const { playSuccess } = useAudio();
  
  // Show welcome modal if tutorial hasn't been completed
  useEffect(() => {
    if (!tutorialCompleted) {
      // Delay opening to ensure everything is loaded
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [tutorialCompleted]);
  
  const handleClose = () => {
    setIsOpen(false);
    completeTutorial();
    playSuccess();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-4xl h-[80vh] px-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="text-2xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-indigo-600">
            Welcome to NEXUSFORGE OS: ARCHITECT EDITION
          </DialogTitle>
          <DialogDescription className="text-center text-lg">
            Your multidimensional creative workspace is ready
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="overview" className="overflow-hidden flex flex-col h-full">
          <div className="px-6">
            <TabsList className="w-full justify-center">
              <TabsTrigger value="overview" className="relative px-8">
                Overview
              </TabsTrigger>
              <TabsTrigger value="features" className="relative px-8">
                Features
              </TabsTrigger>
              <TabsTrigger value="guide" className="relative px-8">
                Quick Start
              </TabsTrigger>
            </TabsList>
          </div>
          
          <div className="mt-4 flex-grow overflow-y-auto">
            <TabsContent value="overview" className="px-6 pb-6 mt-0 h-full">
              <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-6 mb-4">
                <h3 className="text-xl font-semibold mb-2 text-center">A New Paradigm for Creators</h3>
                <div className="grid md:grid-cols-2 gap-6 mt-4">
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="h-5 w-5 text-amber-500" />
                      <h4 className="font-semibold">Multiversal Grid</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Navigate your projects in 3D space, organized by influence rather than time. Projects appear as celestial bodies in a connected universe.
                    </p>
                  </div>
                  
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="h-5 w-5 text-purple-500" />
                      <h4 className="font-semibold">Reality Fusion Lab</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Combine different types of data across realities to create new insights and projects with our revolutionary fusion technology.
                    </p>
                  </div>
                  
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="h-5 w-5 text-cyan-500" />
                      <h4 className="font-semibold">Nexi AI Assistants</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Multiple specialized AI personas help with different aspects of your creative work, each with unique capabilities.
                    </p>
                  </div>
                  
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Lock className="h-5 w-5 text-green-500" />
                      <h4 className="font-semibold">God Mode</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Access advanced system features, monitoring, and configuration. Press 'G' to activate this mode at any time.
                    </p>
                  </div>
                </div>
              </div>
              
              <img 
                src="/images/welcome-overview.png" 
                alt="NEXUSFORGE OS Interface" 
                className="w-full h-auto rounded-lg border shadow-lg object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </TabsContent>
            
            <TabsContent value="features" className="px-6 pb-6 mt-0 h-full">
              <div className="space-y-4">
                <div className="rounded-lg border p-4">
                  <h3 className="text-lg font-semibold mb-2">Universe View</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Projects appear as nodes in 3D space, connected based on relationships rather than timeline.
                  </p>
                  <ul className="text-sm space-y-1">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Navigate with mouse or touch controls</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Select nodes to view details</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Visualize connections between related content</span>
                    </li>
                  </ul>
                </div>
                
                <div className="rounded-lg border p-4">
                  <h3 className="text-lg font-semibold mb-2">Reality Fusion Lab</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Combine different types of content to create new fusion artifacts.
                  </p>
                  <ul className="text-sm space-y-1">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Select multiple reality data types</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Create fusions that appear in the Universe</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Analyze and optimize fusion results</span>
                    </li>
                  </ul>
                </div>
                
                <div className="rounded-lg border p-4">
                  <h3 className="text-lg font-semibold mb-2">AI Assistants (Nexi)</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Multiple specialized AI personas to help with different aspects of your work.
                  </p>
                  <ul className="text-sm space-y-1">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>CodeCore: Programming and technical help</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>VidDrift: Video and animation assistance</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>BrandGhost: Marketing and branding advice</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Oracle: Data analysis and forecasting</span>
                    </li>
                  </ul>
                </div>
                
                <div className="rounded-lg border p-4">
                  <h3 className="text-lg font-semibold mb-2">Advanced System Features</h3>
                  <ul className="text-sm space-y-1">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>God Mode (Press G): System monitoring and advanced controls</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Global Search (Ctrl+K): Find anything quickly</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Accessibility settings for inclusive design</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Creator neural layer for personalized workflow suggestions</span>
                    </li>
                  </ul>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="guide" className="px-6 pb-6 mt-0 h-full">
              <div className="space-y-4">
                <div className="rounded-lg border p-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <span className="h-6 w-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm">1</span>
                    Navigate the Universe
                  </h3>
                  <p className="text-sm text-muted-foreground ml-8 mt-1">
                    Use mouse drag to rotate, scroll to zoom, and click on nodes to select them. On mobile, use touch gestures for the same controls.
                  </p>
                </div>
                
                <div className="rounded-lg border p-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <span className="h-6 w-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm">2</span>
                    Create Fusion Nodes
                  </h3>
                  <p className="text-sm text-muted-foreground ml-8 mt-1">
                    Open the Reality Fusion Lab from the button in the lower right. Select multiple reality data items and click "Create Fusion" to generate new fusion nodes.
                  </p>
                </div>
                
                <div className="rounded-lg border p-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <span className="h-6 w-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm">3</span>
                    Activate God Mode
                  </h3>
                  <p className="text-sm text-muted-foreground ml-8 mt-1">
                    Press the "G" key to toggle God Mode, which provides system monitoring and advanced controls.
                  </p>
                </div>
                
                <div className="rounded-lg border p-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <span className="h-6 w-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm">4</span>
                    Consult AI Assistants
                  </h3>
                  <p className="text-sm text-muted-foreground ml-8 mt-1">
                    Switch to the Assistant view in the top navigation to interact with specialized AI personas.
                  </p>
                </div>
                
                <div className="rounded-lg border p-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <span className="h-6 w-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm">5</span>
                    Use Keyboard Shortcuts
                  </h3>
                  <p className="text-sm text-muted-foreground ml-8 mt-1">
                    <span className="font-mono">G</span> = Toggle God Mode
                    <br />
                    <span className="font-mono">Ctrl+K</span> = Open Global Search
                    <span className="ml-4 font-mono">Space</span> = Select node
                    <br />
                    <span className="font-mono">W/A/S/D</span> = Navigate
                    <span className="ml-4 font-mono">Q/E</span> = Zoom in/out
                  </p>
                </div>
                
                <div className="flex justify-center mt-4">
                  <Button 
                    variant="default" 
                    className="bg-gradient-to-r from-indigo-600 to-purple-600"
                    onClick={handleClose}
                  >
                    <Rocket className="h-4 w-4 mr-2" />
                    Start Exploring
                  </Button>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
        
        <DialogFooter className="px-6 py-4 border-t">
          <Button variant="outline" onClick={handleClose}>
            Skip Introduction
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}