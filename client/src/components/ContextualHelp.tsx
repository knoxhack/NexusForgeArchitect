import React, { useState } from "react";
import { HelpCircle, X, Info, Check, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAudio } from "@/lib/stores/useAudio";
import { useGame } from "@/lib/stores/useGame";
import { useNotifications } from "@/lib/stores/useNotifications";

// Types for help content
interface HelpTopic {
  id: string;
  title: string;
  description: string;
  steps?: string[];
  tips?: string[];
  relatedTopics?: string[];
  icon?: React.ReactNode;
  category: "navigation" | "interface" | "features" | "shortcuts" | "troubleshooting";
}

// Define the help topics
const helpTopics: HelpTopic[] = [
  {
    id: "universe-navigation",
    title: "Universe Navigation",
    description: "Learn how to navigate through the 3D universe view of your projects.",
    steps: [
      "Use WASD or arrow keys to move around the universe",
      "Use mouse or touch to look around",
      "Press Q/E to zoom in/out",
      "Click on a project to view its details"
    ],
    tips: [
      "Hold Shift while moving to increase speed",
      "Double-click a project to focus on it"
    ],
    relatedTopics: ["view-switching", "project-interaction"],
    icon: <Info className="h-5 w-5 text-blue-500" />,
    category: "navigation"
  },
  {
    id: "view-switching",
    title: "Switching Views",
    description: "How to switch between Universe, Timeline, Assistant, and Stats views.",
    steps: [
      "Use the top navigation bar to switch views",
      "Press Tab key to cycle through views",
      "Use the sidebar icons for quick access"
    ],
    tips: [
      "Each view provides different ways to interact with your projects",
      "The Universe view is best for spatial relationships"
    ],
    relatedTopics: ["universe-navigation", "timeline-view"],
    icon: <Info className="h-5 w-5 text-green-500" />,
    category: "navigation"
  },
  {
    id: "god-mode",
    title: "God Mode",
    description: "Access advanced system features and monitoring with God Mode.",
    steps: [
      "Press G key to toggle God Mode",
      "Use the command bar for direct system access",
      "View real-time system metrics and performance data"
    ],
    tips: [
      "God Mode provides detailed analytics about your projects",
      "Use voice commands by clicking the microphone icon"
    ],
    relatedTopics: ["keyboard-shortcuts", "system-metrics"],
    icon: <Info className="h-5 w-5 text-purple-500" />,
    category: "features"
  },
  {
    id: "keyboard-shortcuts",
    title: "Keyboard Shortcuts",
    description: "Speed up your workflow with these keyboard shortcuts.",
    steps: [
      "G - Toggle God Mode",
      "Tab - Cycle between views",
      "Esc - Close current panel",
      "I - Open AI Assistant",
      "WASD/Arrow Keys - Navigate",
      "Space - Select focused item"
    ],
    tips: [
      "Combining Shift with shortcuts often provides alternate functionality",
      "You can customize shortcuts in the Settings panel"
    ],
    relatedTopics: ["accessibility", "god-mode"],
    icon: <Info className="h-5 w-5 text-amber-500" />,
    category: "shortcuts"
  },
  {
    id: "accessibility",
    title: "Accessibility Features",
    description: "Make NEXUSFORGE OS work better for your needs with accessibility options.",
    steps: [
      "Access the accessibility panel from the bottom-left icon",
      "Toggle high contrast mode for better visibility",
      "Enable reduced motion if animations cause discomfort",
      "Adjust text size and animation speed"
    ],
    tips: [
      "Use keyboard navigation for most interface elements",
      "Voice commands are available in God Mode"
    ],
    relatedTopics: ["keyboard-shortcuts", "system-settings"],
    icon: <Info className="h-5 w-5 text-teal-500" />,
    category: "features"
  },
  {
    id: "project-interaction",
    title: "Working with Projects",
    description: "Learn how to create, edit, and connect projects.",
    steps: [
      "Create new projects from the + button",
      "Click on a project to view and edit details",
      "Drag between projects to create connections",
      "Group projects by dragging them together"
    ],
    tips: [
      "Projects can be organized spatially to represent relationships",
      "Use the search function to quickly find projects"
    ],
    relatedTopics: ["universe-navigation", "timeline-view"],
    icon: <Info className="h-5 w-5 text-rose-500" />,
    category: "interface"
  },
  {
    id: "ai-assistants",
    title: "AI Assistants (Nexi)",
    description: "Work with specialized AI assistants to enhance your creative process.",
    steps: [
      "Access the AI panel from the navigation bar or press I",
      "Choose between different AI personas for specialized help",
      "Ask questions or request assistance with your projects",
      "Use the suggestions provided for quick actions"
    ],
    tips: [
      "Each AI persona specializes in different creative domains",
      "You can switch between assistants during a conversation"
    ],
    relatedTopics: ["keyboard-shortcuts", "project-interaction"],
    icon: <Info className="h-5 w-5 text-indigo-500" />,
    category: "features"
  },
  {
    id: "timeline-view",
    title: "Timeline Interface",
    description: "Understand how to use the non-linear timeline view.",
    steps: [
      "The timeline shows project relationships by influence, not chronology",
      "Connect projects by dragging between nodes",
      "Zoom in/out to see different levels of detail",
      "Filter by project type using the controls"
    ],
    tips: [
      "The timeline highlights influence paths between projects",
      "Use the minimap for quick navigation in complex timelines"
    ],
    relatedTopics: ["universe-navigation", "project-interaction"],
    icon: <Info className="h-5 w-5 text-cyan-500" />,
    category: "interface"
  },
  {
    id: "system-metrics",
    title: "Monitoring System Metrics",
    description: "Track performance and usage statistics.",
    steps: [
      "Access system metrics in God Mode",
      "View CPU, memory, and network usage",
      "Monitor project growth and productivity patterns",
      "Check real-time collaboration statistics"
    ],
    tips: [
      "Set alerts for important metrics using the notification system",
      "Export metrics data for external analysis"
    ],
    relatedTopics: ["god-mode", "notifications"],
    icon: <Info className="h-5 w-5 text-lime-500" />,
    category: "features"
  },
  {
    id: "notifications",
    title: "Notification System",
    description: "Understand the different notification types and how to manage them.",
    steps: [
      "Notifications appear in the top-right corner",
      "Different colors indicate different priority levels",
      "Access the notification center from the top navigation bar",
      "Customize notification settings in preferences"
    ],
    tips: [
      "Critical notifications have pulsing animations",
      "You can mute notifications temporarily"
    ],
    relatedTopics: ["system-metrics", "accessibility"],
    icon: <Info className="h-5 w-5 text-orange-500" />,
    category: "interface"
  }
];

const ContextualHelp: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const { playNotification } = useAudio();
  const { recordInteraction } = useGame();
  const { addNotification } = useNotifications();
  
  // Filter topics based on search and category
  const filteredTopics = helpTopics.filter(topic => {
    const matchesSearch = 
      topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = 
      activeCategory === "all" || 
      topic.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      recordInteraction();
      playNotification();
    }
  };
  
  const handleTopicClick = (topic: HelpTopic) => {
    recordInteraction();
    addNotification({
      title: `Help: ${topic.title}`,
      message: "Opened help topic. You can find more related topics in the help panel.",
      type: "info",
      priority: "low",
      source: "Help System"
    });
  };
  
  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="fixed right-4 bottom-4 z-50 rounded-full p-2 bg-black/40 text-white hover:bg-black/60"
          aria-label="Help"
        >
          <HelpCircle className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-blue-500" />
            NEXUSFORGE Help Center
          </SheetTitle>
          <SheetDescription>
            Get assistance with using NEXUSFORGE OS
          </SheetDescription>
          
          <div className="relative my-4">
            <input
              type="text"
              placeholder="Search for help topics..."
              className="w-full px-4 py-2 border border-border rounded-md bg-background text-foreground"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </SheetHeader>
        
        <Tabs defaultValue="all" onValueChange={setActiveCategory} className="my-4">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="all">All Topics</TabsTrigger>
            <TabsTrigger value="navigation">Navigation</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
          </TabsList>
          <TabsList className="grid grid-cols-3 mt-1">
            <TabsTrigger value="interface">Interface</TabsTrigger>
            <TabsTrigger value="shortcuts">Shortcuts</TabsTrigger>
            <TabsTrigger value="troubleshooting">Troubleshooting</TabsTrigger>
          </TabsList>
          
          <div className="my-4">
            {filteredTopics.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-muted-foreground">No help topics found for "{searchQuery}"</p>
              </div>
            ) : (
              <Accordion type="single" collapsible className="w-full">
                {filteredTopics.map((topic) => (
                  <AccordionItem key={topic.id} value={topic.id}>
                    <AccordionTrigger 
                      className="flex items-center py-4"
                      onClick={() => handleTopicClick(topic)}
                    >
                      <div className="flex items-center gap-2">
                        {topic.icon}
                        <span>{topic.title}</span>
                      </div>
                      <Badge variant="outline" className="ml-2">
                        {topic.category}
                      </Badge>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4 px-1">
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">{topic.description}</p>
                        
                        {topic.steps && (
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium">Steps:</h4>
                            <ul className="space-y-1">
                              {topic.steps.map((step, index) => (
                                <li key={index} className="text-sm text-foreground flex items-start gap-2">
                                  <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                  <span>{step}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {topic.tips && (
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium">Tips:</h4>
                            <ul className="space-y-1">
                              {topic.tips.map((tip, index) => (
                                <li key={index} className="text-sm text-foreground flex items-start gap-2">
                                  <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                  <span>{tip}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {topic.relatedTopics && topic.relatedTopics.length > 0 && (
                          <div className="pt-2">
                            <h4 className="text-sm font-medium">Related Topics:</h4>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {topic.relatedTopics.map((relatedId) => {
                                const relatedTopic = helpTopics.find(t => t.id === relatedId);
                                return relatedTopic ? (
                                  <Badge 
                                    key={relatedId} 
                                    variant="secondary"
                                    className="cursor-pointer"
                                    onClick={() => {
                                      const element = document.getElementById(relatedId);
                                      if (element) {
                                        element.scrollIntoView({ behavior: 'smooth' });
                                      }
                                    }}
                                  >
                                    {relatedTopic.title}
                                  </Badge>
                                ) : null;
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </div>
        </Tabs>
        
        <SheetFooter className="flex flex-col sm:flex-row gap-2 mt-4">
          <Button variant="outline" asChild>
            <a href="#" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
              View Full Documentation
            </a>
          </Button>
          <SheetClose asChild>
            <Button className="w-full sm:w-auto">Close Help</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default ContextualHelp;