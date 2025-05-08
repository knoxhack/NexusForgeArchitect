import React, { useState, useEffect } from "react";
import { Keyboard, X, Key, Command, Maximize2, Copy, Info } from "lucide-react";
import { useGame } from "@/lib/stores/useGame";
import { useAudio } from "@/lib/stores/useAudio";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Types for shortcuts
interface ShortcutKey {
  key: string;
  isSpecial?: boolean;
  isModifier?: boolean;
}

interface Shortcut {
  id: string;
  keys: ShortcutKey[];
  description: string;
  category: "navigation" | "interface" | "godmode" | "editing" | "view";
  isAdvanced?: boolean;
}

// List of shortcuts
const shortcuts: Shortcut[] = [
  {
    id: "godmode-toggle",
    keys: [{ key: "G" }],
    description: "Toggle God Mode",
    category: "godmode"
  },
  {
    id: "assistant-toggle",
    keys: [{ key: "I" }],
    description: "Toggle AI Assistant panel",
    category: "interface"
  },
  {
    id: "help-toggle",
    keys: [{ key: "H" }],
    description: "Toggle Help panel",
    category: "interface"
  },
  {
    id: "nav-up",
    keys: [{ key: "W" }],
    description: "Move forward/up",
    category: "navigation"
  },
  {
    id: "nav-down",
    keys: [{ key: "S" }],
    description: "Move backward/down",
    category: "navigation"
  },
  {
    id: "nav-left",
    keys: [{ key: "A" }],
    description: "Move left",
    category: "navigation"
  },
  {
    id: "nav-right",
    keys: [{ key: "D" }],
    description: "Move right",
    category: "navigation"
  },
  {
    id: "zoom-in",
    keys: [{ key: "Q" }],
    description: "Zoom in",
    category: "navigation"
  },
  {
    id: "zoom-out",
    keys: [{ key: "E" }],
    description: "Zoom out",
    category: "navigation"
  },
  {
    id: "select",
    keys: [{ key: "Space" }],
    description: "Select item",
    category: "interface"
  },
  {
    id: "cancel",
    keys: [{ key: "Esc", isSpecial: true }],
    description: "Cancel/Close current panel",
    category: "interface"
  },
  {
    id: "quick-save",
    keys: [{ key: "Ctrl", isModifier: true }, { key: "S" }],
    description: "Quick save",
    category: "editing",
    isAdvanced: true
  },
  {
    id: "quick-search",
    keys: [{ key: "Ctrl", isModifier: true }, { key: "F" }],
    description: "Quick search",
    category: "interface"
  },
  {
    id: "universe-view",
    keys: [{ key: "1" }],
    description: "Switch to Universe view",
    category: "view"
  },
  {
    id: "timeline-view",
    keys: [{ key: "2" }],
    description: "Switch to Timeline view",
    category: "view"
  },
  {
    id: "assistant-view",
    keys: [{ key: "3" }],
    description: "Switch to Assistant view",
    category: "view"
  },
  {
    id: "stats-view",
    keys: [{ key: "4" }],
    description: "Switch to Stats view",
    category: "view"
  },
  {
    id: "fullscreen",
    keys: [{ key: "F11", isSpecial: true }],
    description: "Toggle fullscreen",
    category: "interface"
  },
  {
    id: "godmode-command",
    keys: [{ key: "Ctrl", isModifier: true }, { key: "Space" }],
    description: "Focus God Mode command bar",
    category: "godmode",
    isAdvanced: true
  },
  {
    id: "godmode-metrics",
    keys: [{ key: "Ctrl", isModifier: true }, { key: "M" }],
    description: "Show detailed metrics in God Mode",
    category: "godmode",
    isAdvanced: true
  },
  {
    id: "project-new",
    keys: [{ key: "Ctrl", isModifier: true }, { key: "N" }],
    description: "Create new project",
    category: "editing"
  },
  {
    id: "help-contextual",
    keys: [{ key: "F1", isSpecial: true }],
    description: "Show contextual help",
    category: "interface"
  },
  {
    id: "refresh-view",
    keys: [{ key: "F5", isSpecial: true }],
    description: "Refresh current view",
    category: "view"
  }
];

// Function to render a keyboard key
const KeyboardKey: React.FC<{ shortcutKey: ShortcutKey }> = ({ shortcutKey }) => {
  return (
    <div 
      className={cn(
        "px-2 py-1 min-w-[2rem] h-8 rounded-md inline-flex items-center justify-center text-xs font-medium",
        shortcutKey.isModifier ? "bg-slate-700 text-slate-100" : "bg-slate-800 text-slate-100",
        shortcutKey.isSpecial ? "bg-slate-700 text-slate-100" : ""
      )}
    >
      {shortcutKey.key}
    </div>
  );
};

const ShortcutGuide: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [firstTimeOpen, setFirstTimeOpen] = useState(true);
  const { recordInteraction } = useGame();
  const { playNotification } = useAudio();

  // Filter shortcuts based on category
  const filteredShortcuts = shortcuts.filter(shortcut => 
    activeCategory === "all" || shortcut.category === activeCategory
  );

  // Group shortcuts by category for "all" view
  const groupedShortcuts = filteredShortcuts.reduce((groups, shortcut) => {
    const category = shortcut.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(shortcut);
    return groups;
  }, {} as Record<string, Shortcut[]>);

  // Handle dialog open
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      recordInteraction();
      playNotification();
      
      if (firstTimeOpen) {
        setFirstTimeOpen(false);
      }
    }
  };

  // Show a keyboard shortcut hint when pressing Ctrl
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Show keyboard guide hint when Ctrl is pressed for a while
      if (e.key === "Control" && !isOpen) {
        const timer = setTimeout(() => {
          // Show hint message
          const hintEl = document.createElement("div");
          hintEl.className = "fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-md z-[1000] text-sm flex items-center gap-2";
          hintEl.innerHTML = `<span>Press Ctrl+K to view keyboard shortcuts</span>`;
          document.body.appendChild(hintEl);
          
          // Remove after a moment
          setTimeout(() => {
            document.body.removeChild(hintEl);
          }, 3000);
        }, 1000);
        
        const handleKeyUp = () => {
          clearTimeout(timer);
          document.removeEventListener("keyup", handleKeyUp);
        };
        
        document.addEventListener("keyup", handleKeyUp);
      }
      
      // Ctrl+K to open shortcut guide
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
      }
    };
    
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Render category badge
  const renderCategoryBadge = (category: string) => {
    let color;
    let label;
    
    switch (category) {
      case "navigation":
        color = "bg-blue-600";
        label = "Navigation";
        break;
      case "interface":
        color = "bg-green-600";
        label = "Interface";
        break;
      case "godmode":
        color = "bg-purple-600";
        label = "God Mode";
        break;
      case "editing":
        color = "bg-amber-600";
        label = "Editing";
        break;
      case "view":
        color = "bg-cyan-600";
        label = "View";
        break;
      default:
        color = "bg-gray-600";
        label = category;
    }
    
    return (
      <Badge className={`${color} capitalize`}>{label}</Badge>
    );
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="fixed bottom-16 right-4 z-50 rounded-full p-2 bg-black/40 text-white hover:bg-black/60"
            aria-label="Keyboard Shortcuts"
          >
            <Keyboard className="h-5 w-5" />
          </Button>
        </DialogTrigger>
        
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Keyboard className="h-5 w-5 text-primary" />
              Keyboard Shortcuts
            </DialogTitle>
            <DialogDescription>
              Master NEXUSFORGE OS with these keyboard shortcuts for faster workflow
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="all" onValueChange={setActiveCategory} className="mt-4">
            <TabsList className="grid grid-cols-6 mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="navigation">Navigation</TabsTrigger>
              <TabsTrigger value="interface">Interface</TabsTrigger>
              <TabsTrigger value="godmode">God Mode</TabsTrigger>
              <TabsTrigger value="editing">Editing</TabsTrigger>
              <TabsTrigger value="view">View</TabsTrigger>
            </TabsList>
            
            <ScrollArea className="h-[50vh] border rounded-md p-4">
              {activeCategory === "all" ? (
                <div className="space-y-6">
                  {Object.entries(groupedShortcuts).map(([category, shortcuts]) => (
                    <div key={category} className="space-y-3">
                      <div className="sticky top-0 bg-background/95 backdrop-blur-sm py-1">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          {renderCategoryBadge(category)}
                        </h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {shortcuts.map((shortcut) => (
                          <div 
                            key={shortcut.id} 
                            className={cn(
                              "flex items-center justify-between p-2 rounded-md",
                              "bg-secondary/20 transition-colors hover:bg-secondary/30"
                            )}
                          >
                            <span className="text-sm truncate pr-2">{shortcut.description}</span>
                            <div className="flex items-center gap-1 shrink-0">
                              {shortcut.keys.map((key, index) => (
                                <React.Fragment key={index}>
                                  <KeyboardKey shortcutKey={key} />
                                  {index < shortcut.keys.length - 1 && (
                                    <span className="text-muted-foreground mx-1">+</span>
                                  )}
                                </React.Fragment>
                              ))}
                              {shortcut.isAdvanced && (
                                <Badge variant="outline" className="ml-2 py-0 h-5 text-[10px]">Advanced</Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredShortcuts.map((shortcut) => (
                    <div 
                      key={shortcut.id} 
                      className={cn(
                        "flex items-center justify-between p-2 rounded-md",
                        "bg-secondary/20 transition-colors hover:bg-secondary/30"
                      )}
                    >
                      <span className="text-sm truncate pr-2">{shortcut.description}</span>
                      <div className="flex items-center gap-1 shrink-0">
                        {shortcut.keys.map((key, index) => (
                          <React.Fragment key={index}>
                            <KeyboardKey shortcutKey={key} />
                            {index < shortcut.keys.length - 1 && (
                              <span className="text-muted-foreground mx-1">+</span>
                            )}
                          </React.Fragment>
                        ))}
                        {shortcut.isAdvanced && (
                          <Badge variant="outline" className="ml-2 py-0 h-5 text-[10px]">Advanced</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </Tabs>
          
          <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4 items-center justify-between">
            <div className="flex items-center text-sm text-muted-foreground">
              <Info className="h-4 w-4 mr-1" />
              <span>Press <kbd className="px-1 py-0.5 bg-secondary rounded text-xs">Ctrl</kbd> + <kbd className="px-1 py-0.5 bg-secondary rounded text-xs">K</kbd> to open shortcuts anytime</span>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <a href="#" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                  <Copy className="h-4 w-4" />
                  <span>Print Shortcuts</span>
                </a>
              </Button>
              <Button variant="default" size="sm" onClick={() => setIsOpen(false)}>
                Close
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Shortcut hints that appear when pressing certain keys */}
      <div id="shortcut-hint-container" className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-[1000]"></div>
    </>
  );
};

export default ShortcutGuide;