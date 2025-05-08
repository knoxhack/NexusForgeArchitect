import React, { useState, useEffect, useRef } from "react";
import { Search, X, FileText, Clock, Tag, Star, ExternalLink, ArrowRight, Calendar, User, Filter, Settings } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { 
  CommandDialog, 
  CommandEmpty, 
  CommandGroup, 
  CommandInput, 
  CommandItem, 
  CommandList, 
  CommandSeparator,
  CommandShortcut 
} from "./ui/command";
import { useAudio } from "../lib/stores/useAudio";
import { useGame } from "../lib/stores/useGame";

// Define the ProjectType
type ProjectType = "video" | "model" | "audio" | "code";

// Search result types
interface SearchResultBase {
  id: string;
  title: string;
  type: "project" | "timeline" | "assistant" | "settings" | "help" | "command";
  icon: React.ReactNode;
  description?: string;
  tags?: string[];
  date?: string;
}

interface ProjectResult extends SearchResultBase {
  type: "project";
  projectType: ProjectType;
}

interface TimelineResult extends SearchResultBase {
  type: "timeline";
  eventType: "creation" | "update" | "milestone";
}

interface AssistantResult extends SearchResultBase {
  type: "assistant";
  persona: string;
}

interface CommandResult extends SearchResultBase {
  type: "command";
  shortcut?: string;
}

type SearchResult = ProjectResult | TimelineResult | AssistantResult | CommandResult | SearchResultBase;

// Mock data for search results
const mockSearchResults: SearchResult[] = [
  {
    id: "p1",
    title: "NEXUSFORGE Core System",
    type: "project",
    projectType: "code",
    icon: <FileText className="h-4 w-4 text-blue-500" />,
    description: "Main system architecture and core components",
    tags: ["system", "architecture", "core"],
    date: "2025-04-15"
  },
  {
    id: "p2",
    title: "Celestial Navigation Interface",
    type: "project",
    projectType: "model",
    icon: <FileText className="h-4 w-4 text-purple-500" />,
    description: "3D navigation module for universal view",
    tags: ["3D", "navigation", "UI"],
    date: "2025-04-22"
  },
  {
    id: "p3",
    title: "Reality Fusion Algorithm",
    type: "project",
    projectType: "code",
    icon: <FileText className="h-4 w-4 text-blue-500" />,
    description: "Core algorithm for combining multi-reality data",
    tags: ["algorithm", "fusion", "data"],
    date: "2025-04-28"
  },
  {
    id: "t1",
    title: "Initial System Architecture",
    type: "timeline",
    eventType: "milestone",
    icon: <Calendar className="h-4 w-4 text-green-500" />,
    description: "System architecture finalized",
    date: "2025-04-10"
  },
  {
    id: "t2",
    title: "Reality Fusion Module Complete",
    type: "timeline",
    eventType: "milestone",
    icon: <Calendar className="h-4 w-4 text-green-500" />,
    description: "Module for combining data across realities",
    date: "2025-04-25"
  },
  {
    id: "a1",
    title: "CodeCore Conversation",
    type: "assistant",
    persona: "CodeCore",
    icon: <User className="h-4 w-4 text-indigo-500" />,
    description: "Discussion about system architecture",
    date: "2025-04-18"
  },
  {
    id: "a2",
    title: "VidDrift Conversation",
    type: "assistant",
    persona: "VidDrift",
    icon: <User className="h-4 w-4 text-indigo-500" />,
    description: "Video production techniques for AR",
    date: "2025-04-22"
  },
  {
    id: "cmd1",
    title: "Toggle God Mode",
    type: "command",
    icon: <Settings className="h-4 w-4 text-amber-500" />,
    description: "Access advanced system monitoring",
    shortcut: "G"
  },
  {
    id: "cmd2",
    title: "Create New Project",
    type: "command",
    icon: <Settings className="h-4 w-4 text-amber-500" />,
    description: "Start a new project creation wizard",
    shortcut: "Ctrl+N"
  },
  {
    id: "h1",
    title: "Navigating the Universe",
    type: "help",
    icon: <ExternalLink className="h-4 w-4 text-cyan-500" />,
    description: "Understanding project navigation in 3D space"
  },
  {
    id: "s1",
    title: "Keyboard Shortcuts",
    type: "settings",
    icon: <Settings className="h-4 w-4 text-red-500" />,
    description: "Configure keyboard shortcuts"
  }
];

// Type for search groups
interface SearchGroup {
  label: string;
  type: SearchResult["type"] | "all";
  icon: React.ReactNode;
  results: SearchResult[];
}

// Main component
const GlobalSearch: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredResults, setFilteredResults] = useState<SearchResult[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<SearchGroup["type"]>("all");
  const { playNotification, playHit } = useAudio();
  const { recordInteraction } = useGame();
  
  // Filter results based on search query and group
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredResults(mockSearchResults);
      return;
    }
    
    const query = searchQuery.toLowerCase().trim();
    const filtered = mockSearchResults.filter((result) => {
      const matchesQuery = 
        result.title.toLowerCase().includes(query) || 
        (result.description && result.description.toLowerCase().includes(query)) ||
        (result.tags && result.tags.some(tag => tag.toLowerCase().includes(query)));
      
      const matchesGroup = selectedGroup === "all" || result.type === selectedGroup;
      
      return matchesQuery && matchesGroup;
    });
    
    setFilteredResults(filtered);
  }, [searchQuery, selectedGroup]);
  
  // Group the filtered results
  const groupedResults = filteredResults.reduce((groups: SearchGroup[], result) => {
    const existingGroup = groups.find(group => group.type === result.type);
    
    if (existingGroup) {
      existingGroup.results.push(result);
    } else {
      let icon;
      let label;
      
      switch (result.type) {
        case "project":
          icon = <FileText className="h-4 w-4" />;
          label = "Projects";
          break;
        case "timeline":
          icon = <Calendar className="h-4 w-4" />;
          label = "Timeline Events";
          break;
        case "assistant":
          icon = <User className="h-4 w-4" />;
          label = "AI Conversations";
          break;
        case "command":
          icon = <Settings className="h-4 w-4" />;
          label = "Commands";
          break;
        case "help":
          icon = <ExternalLink className="h-4 w-4" />;
          label = "Help Articles";
          break;
        case "settings":
          icon = <Settings className="h-4 w-4" />;
          label = "Settings";
          break;
        default:
          icon = <Star className="h-4 w-4" />;
          label = "Other Results";
      }
      
      groups.push({
        label,
        type: result.type,
        icon,
        results: [result]
      });
    }
    
    return groups;
  }, []);
  
  // Sort groups by number of results (most results first)
  const sortedGroups = [...groupedResults].sort((a, b) => b.results.length - a.results.length);
  
  // Handle keyboard shortcut for search (Ctrl+F or Cmd+F)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        setIsOpen(true);
        playNotification();
      }
      
      // Also allow pressing escape to close
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, playNotification]);
  
  // Handle selecting a search result
  const handleSelectResult = (result: SearchResult) => {
    playHit();
    recordInteraction();
    console.log(`Selected result: ${result.title} (${result.type})`);
    
    // In a real implementation, this would navigate or perform an action
    // based on the result type
    switch (result.type) {
      case "project":
        // Navigate to project detail
        break;
      case "timeline":
        // Navigate to timeline event
        break;
      case "assistant":
        // Open chat with this assistant
        break;
      case "command":
        // Execute command
        break;
      case "help":
        // Show help article
        break;
      case "settings":
        // Open settings panel
        break;
    }
    
    setIsOpen(false);
  };
  
  // Format the date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return "Today";
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 30) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };
  
  // Render tag badges
  const renderTags = (tags?: string[]) => {
    if (!tags || tags.length === 0) return null;
    
    return (
      <div className="flex flex-wrap gap-1 mt-1">
        {tags.map((tag, index) => (
          <Badge
            key={index}
            variant="outline"
            className="px-1.5 py-0 text-[10px] h-4"
          >
            {tag}
          </Badge>
        ))}
      </div>
    );
  };
  
  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="fixed right-4 top-4 z-50 rounded-full p-2 bg-black/40 text-white hover:bg-black/60"
        onClick={() => {
          setIsOpen(true);
          playNotification();
        }}
        aria-label="Global Search"
      >
        <Search className="h-5 w-5" />
      </Button>
      
      <CommandDialog open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex flex-col h-[80vh] max-h-[600px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects, commands, help..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 rounded-t-lg"
              autoFocus
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
          
          <div className="flex flex-1 overflow-hidden">
            {/* Category Filter Sidebar */}
            <div className="min-w-[160px] border-r border-border p-2 overflow-y-auto">
              <div className="space-y-1">
                <Button
                  variant={selectedGroup === "all" ? "secondary" : "ghost"}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setSelectedGroup("all")}
                >
                  <Star className="h-4 w-4 mr-2" />
                  <span>All Results</span>
                </Button>
                
                <Button
                  variant={selectedGroup === "project" ? "secondary" : "ghost"}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setSelectedGroup("project")}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  <span>Projects</span>
                </Button>
                
                <Button
                  variant={selectedGroup === "timeline" ? "secondary" : "ghost"}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setSelectedGroup("timeline")}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>Timeline</span>
                </Button>
                
                <Button
                  variant={selectedGroup === "assistant" ? "secondary" : "ghost"}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setSelectedGroup("assistant")}
                >
                  <User className="h-4 w-4 mr-2" />
                  <span>Assistants</span>
                </Button>
                
                <Button
                  variant={selectedGroup === "command" ? "secondary" : "ghost"}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setSelectedGroup("command")}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  <span>Commands</span>
                </Button>
                
                <Button
                  variant={selectedGroup === "help" ? "secondary" : "ghost"}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setSelectedGroup("help")}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  <span>Help</span>
                </Button>
                
                <Button
                  variant={selectedGroup === "settings" ? "secondary" : "ghost"}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setSelectedGroup("settings")}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  <span>Settings</span>
                </Button>
              </div>
            </div>
            
            {/* Search Results */}
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full py-2 px-1">
                {filteredResults.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-8 text-center">
                    <Search className="h-8 w-8 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No results found for "{searchQuery}"</p>
                    <p className="text-xs text-muted-foreground mt-1">Try different keywords or filters</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sortedGroups.map((group) => (
                      <div key={group.type} className="space-y-2">
                        <div className="flex items-center px-2 py-1.5 text-sm font-medium text-muted-foreground">
                          {group.icon}
                          <span className="ml-2">{group.label}</span>
                          <span className="ml-1 text-xs">({group.results.length})</span>
                        </div>
                        
                        <div className="space-y-1">
                          {group.results.map((result) => (
                            <button
                              key={result.id}
                              className="w-full text-left px-2 py-2 rounded-md hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
                              onClick={() => handleSelectResult(result)}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex items-start gap-2">
                                  <div className="mt-0.5">{result.icon}</div>
                                  <div>
                                    <div className="font-medium">{result.title}</div>
                                    {result.description && (
                                      <div className="text-sm text-muted-foreground line-clamp-1">
                                        {result.description}
                                      </div>
                                    )}
                                    {renderTags(result.tags)}
                                  </div>
                                </div>
                                
                                <div className="flex flex-col items-end ml-2">
                                  {result.date && (
                                    <span className="text-xs text-muted-foreground">
                                      {formatDate(result.date)}
                                    </span>
                                  )}
                                  {'shortcut' in result && result.shortcut && (
                                    <kbd className="px-1.5 py-0.5 bg-muted text-muted-foreground rounded text-xs mt-1">
                                      {result.shortcut}
                                    </kbd>
                                  )}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>
          
          <div className="p-2 border-t border-border flex justify-between items-center text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>Press <kbd className="px-1.5 py-0.5 bg-muted rounded">↑</kbd> <kbd className="px-1.5 py-0.5 bg-muted rounded">↓</kbd> to navigate</span>
              <span>Press <kbd className="px-1.5 py-0.5 bg-muted rounded">Enter</kbd> to select</span>
              <span>Press <kbd className="px-1.5 py-0.5 bg-muted rounded">Esc</kbd> to close</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="h-3 w-3" />
              <span>{filteredResults.length} results</span>
            </div>
          </div>
        </div>
      </CommandDialog>
    </>
  );
};

export default GlobalSearch;