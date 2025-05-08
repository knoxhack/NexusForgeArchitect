import React, { useState, useEffect } from "react";
import { useGame } from "@/lib/stores/useGame";
import { useAudio } from "@/lib/stores/useAudio";
import { useNotifications } from "@/lib/stores/useNotifications";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X, ChevronRight, ChevronLeft, Sparkles, Lightbulb, Zap, RotateCw, MousePointer, Keyboard } from "lucide-react";

interface TutorialStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  position?: "left" | "right" | "center";
  highlight?: string; // CSS selector for element to highlight
}

const OnboardingTutorial: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasSeenTutorial, setHasSeenTutorial] = useState(false);
  const { setViewMode, recordInteraction } = useGame();
  const { playSuccess, playNotification } = useAudio();
  const { addNotification } = useNotifications();

  // Tutorial steps
  const tutorialSteps: TutorialStep[] = [
    {
      title: "Welcome to NEXUSFORGE OS",
      description: "This tutorial will introduce you to the powerful features of NEXUSFORGE OS, your creative management platform across multiple realities.",
      icon: <Sparkles className="h-8 w-8 text-blue-400" />,
      position: "center"
    },
    {
      title: "Explore the Universe",
      description: "Your projects appear as celestial bodies in a universe, connected by influence rather than chronology. Use mouse or touch to navigate the 3D space.",
      icon: <RotateCw className="h-8 w-8 text-purple-400" />,
      position: "center"
    },
    {
      title: "Special Navigation Controls",
      description: "Use arrow keys to navigate, or drag and pinch on mobile. Press G key to enter God Mode for advanced system monitoring and controls.",
      icon: <Keyboard className="h-8 w-8 text-green-400" />,
      position: "right"
    },
    {
      title: "AI Assistants",
      description: "Multiple specialized AI assistants (Nexi) are available to help with different tasks. Access them from the navigation menu or press the I key.",
      icon: <Zap className="h-8 w-8 text-yellow-400" />,
      position: "left"
    },
    {
      title: "God Mode",
      description: "Press G to activate God Mode for system monitoring, advanced visualization, and direct command access.",
      icon: <Lightbulb className="h-8 w-8 text-cyan-400" />,
      position: "center"
    },
    {
      title: "Touch & Click Interactions",
      description: "Click on projects to view details, create connections, and manage your creative workflow.",
      icon: <MousePointer className="h-8 w-8 text-blue-400" />,
      position: "right"
    },
    {
      title: "You're Ready to Create!",
      description: "NEXUSFORGE OS is now at your command. Leverage the power of multi-reality creative management to build amazing things!",
      icon: <Sparkles className="h-8 w-8 text-violet-400" />,
      position: "center"
    }
  ];

  // Check if user has seen tutorial
  useEffect(() => {
    const tutorialSeen = localStorage.getItem("nexusforge_tutorial_seen");
    if (tutorialSeen) {
      setHasSeenTutorial(true);
    } else {
      // Show tutorial after a short delay on first load
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
      playNotification();
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      playNotification();
    }
  };

  const handleComplete = () => {
    // Mark tutorial as seen
    localStorage.setItem("nexusforge_tutorial_seen", "true");
    setHasSeenTutorial(true);
    setIsOpen(false);
    playSuccess();
    recordInteraction();
    
    // Add congratulatory notification
    addNotification({
      title: "Tutorial Completed",
      message: "You're now ready to harness the full power of NEXUSFORGE OS!",
      type: "success",
      priority: "medium",
      source: "Tutorial System"
    });
  };

  const handleSkip = () => {
    localStorage.setItem("nexusforge_tutorial_seen", "true");
    setHasSeenTutorial(true);
    setIsOpen(false);
    playNotification();
    
    addNotification({
      title: "Tutorial Skipped",
      message: "You can access help anytime by pressing the help button.",
      type: "info",
      priority: "low",
      source: "Tutorial System"
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-md bg-black/80 border border-cyan-500/30 text-white backdrop-blur-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            {tutorialSteps[currentStep].icon}
            <DialogTitle className="text-xl font-bold text-cyan-400">
              {tutorialSteps[currentStep].title}
            </DialogTitle>
          </div>
          <DialogDescription className="text-md text-gray-200 mt-2">
            {tutorialSteps[currentStep].description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex items-center justify-center my-4">
          <div className="flex gap-1">
            {tutorialSteps.map((_, index) => (
              <div 
                key={index} 
                className={`h-1 rounded-full ${
                  index === currentStep 
                    ? "w-6 bg-cyan-400" 
                    : "w-2 bg-gray-600"
                }`}
              />
            ))}
          </div>
        </div>
        
        <DialogFooter className="flex justify-between items-center">
          <div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-gray-400 hover:text-white"
              onClick={handleSkip}
            >
              Skip Tutorial
            </Button>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="border-cyan-800 text-cyan-400 hover:bg-cyan-900/20"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button 
              variant="default" 
              size="sm" 
              onClick={handleNext}
              className="bg-cyan-700 hover:bg-cyan-600 text-white"
            >
              {currentStep < tutorialSteps.length - 1 ? (
                <>
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </>
              ) : (
                "Complete"
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingTutorial;