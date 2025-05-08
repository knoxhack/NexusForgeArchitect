import React, { useState, useEffect, useMemo } from "react";
import { 
  Layers, Cpu, Video, Music, Code, FileText, Upload, RefreshCw, X, Check, 
  AlertTriangle, Search, Filter, TrendingUp, ListFilter, Zap, SlidersHorizontal,
  Info, Wand2, ArrowDownUp, Eye
} from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Input } from "./ui/input";
import { Slider } from "./ui/slider";
import { Checkbox } from "./ui/checkbox";
import { Switch } from "./ui/switch";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { useAudio } from "../lib/stores/useAudio";
import { useGame } from "../lib/stores/useGame";
import { useNotifications } from "../lib/stores/useNotifications";
import { 
  useRealityFusion, 
  performFusion,
  getRealityDataById,
  RealityType,
  RealityData,
  FusionResult
} from "../lib/stores/useRealityFusion";

// Helper function to get icon for reality type
const getRealityIcon = (type: RealityType) => {
  switch (type) {
    case "model":
      return <Layers className="h-5 w-5 text-purple-500" />;
    case "video":
      return <Video className="h-5 w-5 text-blue-500" />;
    case "audio":
      return <Music className="h-5 w-5 text-green-500" />;
    case "code":
      return <Code className="h-5 w-5 text-amber-500" />;
    case "text":
      return <FileText className="h-5 w-5 text-cyan-500" />;
    default:
      return <FileText className="h-5 w-5" />;
  }
};

// Main component
export default function RealityFusion() {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [fusionInProgress, setFusionInProgress] = useState<boolean>(false);
  const [progressValue, setProgressValue] = useState<number>(0);
  const [currentFusion, setCurrentFusion] = useState<FusionResult | null>(null);
  const [showResult, setShowResult] = useState<boolean>(false);
  const [selectedRealityData, setSelectedRealityData] = useState<RealityData[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest" | "name">("newest");
  const [filterByTags, setFilterByTags] = useState<string[]>([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);
  const [compatibilityThreshold, setCompatibilityThreshold] = useState<number>(65);
  const [selectionMode, setSelectionMode] = useState<"single" | "multi">("single");
  
  // Get data from our reality fusion store
  const { 
    realityData, 
    fusionResults, 
    selectedItems,
    selectItem,
    deselectItem,
    clearSelection,
    addFusionResult,
    addRecentFusion
  } = useRealityFusion();
  
  const { playSuccess, playError, playNotification } = useAudio();
  const { recordInteraction } = useGame();
  const { addNotification } = useNotifications();
  
  // Update selected reality data when selectedItems changes
  useEffect(() => {
    const items = selectedItems
      .map(id => realityData.find(item => item.id === id))
      .filter((item): item is RealityData => !!item);
    setSelectedRealityData(items);
  }, [selectedItems, realityData]);
  
  // Extract all unique tags from reality data
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    realityData.forEach(item => {
      item.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags);
  }, [realityData]);
  
  // Calculate compatibility between selected items
  const calculateCompatibility = useMemo(() => {
    if (selectedRealityData.length < 2) return 100;
    
    // Calculate "compatibility" based on selected data types
    // This is a simulated calculation - would be more complex in a real app
    let baseCompatibility = 100;
    
    // More items means more complexity, which reduces compatibility
    baseCompatibility -= (selectedRealityData.length - 2) * 5;
    
    // Different types have different compatibility weights
    const typeMap: Record<string, number> = {};
    selectedRealityData.forEach(item => {
      typeMap[item.type] = (typeMap[item.type] || 0) + 1;
    });
    
    // If only one item of a type, small penalty
    Object.values(typeMap).forEach(count => {
      if (count === 1) baseCompatibility -= 5;
    });
    
    // Certain combinations work better together
    if (typeMap['audio'] && typeMap['video']) baseCompatibility += 10; // Audio-video is good
    if (typeMap['code'] && typeMap['model']) baseCompatibility += 5; // Code-model can work
    
    // Cap the value between 20 and 100
    return Math.max(20, Math.min(100, baseCompatibility));
  }, [selectedRealityData]);
  
  // Apply all filtering, sorting, and searching
  const processedData = useMemo(() => {
    // First, filter by type
    let result = activeTab === "all" 
      ? realityData 
      : realityData.filter(item => item.type === activeTab);
    
    // Then apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        item => 
          item.name.toLowerCase().includes(query) || 
          item.description.toLowerCase().includes(query) ||
          item.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Filter by selected tags
    if (filterByTags.length > 0) {
      result = result.filter(
        item => item.tags.some(tag => filterByTags.includes(tag))
      );
    }
    
    // Apply sorting
    switch (sortOrder) {
      case "newest":
        result = [...result].sort((a, b) => 
          new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime()
        );
        break;
      case "oldest":
        result = [...result].sort((a, b) => 
          new Date(a.dateCreated).getTime() - new Date(b.dateCreated).getTime()
        );
        break;
      case "name":
        result = [...result].sort((a, b) => a.name.localeCompare(b.name));
        break;
    }
    
    return result;
  }, [realityData, activeTab, searchQuery, filterByTags, sortOrder]);
    
  // Handle selecting an item
  const handleSelectItem = (item: RealityData) => {
    recordInteraction();
    playNotification();
    
    if (selectedItems.includes(item.id)) {
      deselectItem(item.id);
    } else {
      selectItem(item.id);
    }
  };
  
  // Check if an item is selected
  const isSelected = (itemId: string) => {
    return selectedItems.includes(itemId);
  };
  
  // Get game store actions for universe nodes
  const { createFusionNode, selectNode } = useGame();
  
  // Handle starting the fusion process
  const handleStartFusion = () => {
    recordInteraction();
    
    if (selectedItems.length < 2) {
      playError();
      addNotification({
        title: "Fusion Error",
        message: "Select at least 2 items to start the fusion process.",
        type: "error",
        priority: "medium",
        source: "Reality Fusion"
      });
      return;
    }
    
    // Start the fusion process
    setFusionInProgress(true);
    
    // Simulate progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        
        // Create fusion name from selected items
        const typesString = selectedRealityData
          .map(item => item.type.charAt(0).toUpperCase() + item.type.slice(1))
          .join("-");
        
        // Create description from selected items
        const descriptionString = `Combined ${selectedRealityData.map(item => item.type).join(" and ")} for enhanced interaction`;
        
        // Use our performFusion helper to create the fusion
        const fusionName = `Fusion ${typesString}`;
        
        // Process the fusion (simulated)
        performFusion(selectedItems, fusionName, descriptionString)
          .then(newFusion => {
            setCurrentFusion(newFusion);
            
            // Create a universe node for this fusion
            const fusionNodeId = createFusionNode(
              fusionName,
              selectedItems,
              {
                description: descriptionString,
                fusionId: newFusion.id,
                compatibility: newFusion.compatibility,
                dateCreated: newFusion.dateCreated,
                sourceTypes: selectedRealityData.map(item => item.type)
              }
            );
            
            // Complete the process
            setTimeout(() => {
              setFusionInProgress(false);
              setShowResult(true);
              playSuccess();
              
              // Switch to the new node in the universe
              selectNode(fusionNodeId);
              
              addNotification({
                title: "Fusion Complete",
                message: `Reality fusion process completed successfully with ${newFusion.compatibility}% compatibility.`,
                type: "success",
                priority: "high",
                source: "Reality Fusion"
              });
              
              // Add a specialized notification about the universe node
              setTimeout(() => {
                addNotification({
                  title: "Universe Updated",
                  message: "A new fusion node has been added to the universe. You can view it in the Universe view.",
                  type: "info",
                  priority: "medium",
                  source: "NexusForge OS"
                });
              }, 2000);
            }, 500);
          })
          .catch(error => {
            setFusionInProgress(false);
            playError();
            addNotification({
              title: "Fusion Error",
              message: error.message,
              type: "error",
              priority: "high",
              source: "Reality Fusion"
            });
          });
      }
      setProgressValue(progress);
    }, 200);
  };
  
  // Handle clearing selection
  const handleClearSelection = () => {
    clearSelection();
    playNotification();
  };
  
  // Format file size for display
  const formatFileSize = (size: string) => {
    return size;
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };
  
  return (
    <div className="bg-background rounded-lg border border-border shadow-lg w-full max-w-4xl mx-auto overflow-hidden">
      <div className="p-4 border-b border-border flex justify-between items-center">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Reality Fusion Lab</h2>
        </div>
        <Badge variant="outline" className="font-mono text-xs">
          v2.5.0
        </Badge>
      </div>
      
      <div className="p-4">
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-6 mb-4">
            <TabsTrigger value="all" className="flex items-center gap-1">
              <Cpu className="h-4 w-4" />
              <span>All</span>
            </TabsTrigger>
            <TabsTrigger value="model" className="flex items-center gap-1">
              <Layers className="h-4 w-4" />
              <span>Models</span>
            </TabsTrigger>
            <TabsTrigger value="video" className="flex items-center gap-1">
              <Video className="h-4 w-4" />
              <span>Video</span>
            </TabsTrigger>
            <TabsTrigger value="audio" className="flex items-center gap-1">
              <Music className="h-4 w-4" />
              <span>Audio</span>
            </TabsTrigger>
            <TabsTrigger value="code" className="flex items-center gap-1">
              <Code className="h-4 w-4" />
              <span>Code</span>
            </TabsTrigger>
            <TabsTrigger value="text" className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              <span>Text</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-0">
            {/* Search and filter bar */}
            <div className="mb-4 flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search by name, description, or tags..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <Select 
                  value={sortOrder} 
                  onValueChange={(value) => setSortOrder(value as "newest" | "oldest" | "name")}
                >
                  <SelectTrigger className="w-[180px]">
                    <div className="flex items-center gap-2">
                      <ArrowDownUp className="h-4 w-4" />
                      <SelectValue placeholder="Sort by" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="name">Name (A-Z)</SelectItem>
                  </SelectContent>
                </Select>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                        className={showAdvancedFilters ? "bg-muted" : ""}
                      >
                        <SlidersHorizontal className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Advanced Filters</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              
              {showAdvancedFilters && (
                <div className="p-3 bg-muted/50 border rounded-md flex flex-col gap-3">
                  <div className="flex gap-2 items-center">
                    <h4 className="text-sm font-medium">Selection Mode:</h4>
                    <div className="flex items-center gap-1">
                      <Button 
                        variant={selectionMode === "single" ? "default" : "outline"} 
                        size="sm"
                        onClick={() => setSelectionMode("single")}
                        className="h-7 px-2"
                      >
                        Single
                      </Button>
                      <Button 
                        variant={selectionMode === "multi" ? "default" : "outline"} 
                        size="sm"
                        onClick={() => setSelectionMode("multi")}
                        className="h-7 px-2"
                      >
                        Multi
                      </Button>
                    </div>
                    <Separator orientation="vertical" className="h-6 mx-2" />
                    <span className="text-sm">Filter by tags:</span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex items-center gap-1 h-7"
                        >
                          <Filter className="h-3.5 w-3.5" />
                          <span>Tags</span>
                          {filterByTags.length > 0 && (
                            <Badge variant="secondary" className="ml-1 py-0 h-5">
                              {filterByTags.length}
                            </Badge>
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="p-0 max-h-52 overflow-auto">
                        <div className="p-2">
                          {allTags.map((tag) => (
                            <div key={tag} className="flex items-center space-x-2 p-1">
                              <Checkbox 
                                id={`tag-${tag}`}
                                checked={filterByTags.includes(tag)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setFilterByTags([...filterByTags, tag]);
                                  } else {
                                    setFilterByTags(filterByTags.filter(t => t !== tag));
                                  }
                                }}
                              />
                              <label
                                htmlFor={`tag-${tag}`}
                                className="text-sm cursor-pointer"
                              >
                                {tag}
                              </label>
                            </div>
                          ))}
                        </div>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-medium min-w-[135px]">Compatibility Threshold:</h4>
                    <Slider
                      min={0}
                      max={100}
                      step={5}
                      value={[compatibilityThreshold]}
                      onValueChange={(value) => setCompatibilityThreshold(value[0])}
                      className="flex-1 mr-2"
                    />
                    <span className="text-sm font-mono bg-background px-2 py-1 rounded border min-w-[40px] text-center">
                      {compatibilityThreshold}%
                    </span>
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div>
                  {processedData.length} {processedData.length === 1 ? 'item' : 'items'} found
                  {searchQuery && <span className="ml-2">for "{searchQuery}"</span>}
                  {filterByTags.length > 0 && (
                    <span className="ml-2">
                      with tags: {filterByTags.map(t => `"${t}"`).join(", ")}
                    </span>
                  )}
                </div>
                {(searchQuery || filterByTags.length > 0) && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      setSearchQuery("");
                      setFilterByTags([]);
                    }}
                    className="h-6"
                  >
                    Clear filters
                  </Button>
                )}
              </div>
            </div>
            
            <div className="flex gap-4">
              {/* Reality data grid */}
              <div className="flex-1">
                <ScrollArea className="h-[400px] rounded-md border">
                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {processedData.length === 0 ? (
                      <div className="col-span-2 py-12 flex flex-col items-center justify-center text-center text-muted-foreground">
                        <Search className="h-12 w-12 mb-4 opacity-20" />
                        <p>No matching items found</p>
                        {(searchQuery || filterByTags.length > 0 || activeTab !== "all") && (
                          <Button
                            variant="link"
                            onClick={() => {
                              setSearchQuery("");
                              setFilterByTags([]);
                              setActiveTab("all");
                            }}
                            className="mt-2"
                          >
                            Clear all filters
                          </Button>
                        )}
                      </div>
                    ) : (
                      processedData.map((item: RealityData) => (
                        <div 
                          key={item.id}
                          className={`
                            p-3 rounded-lg border cursor-pointer transition-all
                            ${isSelected(item.id) 
                              ? 'border-primary bg-primary/10 shadow-md' 
                              : 'border-border hover:border-primary/50 hover:bg-muted'}
                          `}
                          onClick={() => handleSelectItem(item)}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              {getRealityIcon(item.type)}
                              <span className="font-medium">{item.name}</span>
                            </div>
                            {isSelected(item.id) && (
                              <Check className="h-4 w-4 text-primary" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{formatDate(item.dateCreated)}</span>
                            <span>{formatFileSize(item.size)}</span>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {item.tags.map((tag: string, index: number) => (
                              <Badge key={index} variant="outline" className="text-[10px]">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </div>
              
              {/* Selection and controls */}
              <div className="w-80 border rounded-md flex flex-col">
                <div className="p-3 border-b bg-muted/30 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-primary" />
                    <h3 className="font-medium">Selected Items</h3>
                    {selectedItems.length > 0 && (
                      <Badge variant="secondary" className="ml-1">
                        {selectedItems.length}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-7 w-7"
                            disabled={selectedItems.length === 0}
                            onClick={handleClearSelection}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                          <p>Clear Selection</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
                
                <div className="flex-1 flex flex-col">
                  {selectedItems.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center text-muted-foreground p-6">
                      <Layers className="h-12 w-12 mb-3 opacity-20" />
                      <p className="text-sm">Select at least two items<br/>to begin the fusion process</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Different item types have varying compatibility ratings
                      </p>
                    </div>
                  ) : (
                    <div className="p-3">
                      <ScrollArea className="max-h-[250px]">
                        <div className="space-y-2">
                          {selectedRealityData.map((item: RealityData) => (
                            <div 
                              key={item.id}
                              className="flex items-center gap-2 p-2 rounded-md bg-background border"
                            >
                              <div className="relative">
                                {getRealityIcon(item.type)}
                                <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-background rounded-full flex items-center justify-center">
                                  <span className="w-2 h-2 rounded-full bg-primary" />
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm truncate">{item.name}</div>
                                <div className="text-xs text-muted-foreground flex items-center gap-1">
                                  <span className="capitalize">{item.type}</span>
                                  <span className="text-[10px] text-muted-foreground/70">
                                    • {item.tags.slice(0, 2).join(", ")}
                                    {item.tags.length > 2 && "..."}
                                  </span>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => handleSelectItem(item)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                      
                      {selectedItems.length >= 2 && (
                        <>
                          <div className="mt-4 pt-3 border-t">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm font-medium">Compatibility</span>
                              <span 
                                className={`text-sm font-medium ${
                                  calculateCompatibility > 80 
                                    ? "text-green-500" 
                                    : calculateCompatibility > 60 
                                      ? "text-amber-500" 
                                      : "text-red-500"
                                }`}
                              >
                                {calculateCompatibility}%
                              </span>
                            </div>
                            <Progress 
                              value={calculateCompatibility} 
                              className={`h-2 ${
                                calculateCompatibility > 80 
                                  ? "bg-green-500" 
                                  : calculateCompatibility > 60 
                                    ? "bg-amber-500" 
                                    : "bg-red-500"
                              }`}
                            />
                            
                            <div className="mt-3 text-xs text-muted-foreground">
                              {calculateCompatibility > 80 ? (
                                <div className="flex items-center gap-1">
                                  <Check className="h-3.5 w-3.5 text-green-500" />
                                  <span>High compatibility, excellent fusion expected</span>
                                </div>
                              ) : calculateCompatibility > 60 ? (
                                <div className="flex items-center gap-1">
                                  <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                                  <span>Medium compatibility, some data loss possible</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1">
                                  <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                                  <span>Low compatibility, significant data loss possible</span>
                                </div>
                              )}
                            </div>
                            
                            <Button 
                              className="w-full mt-3" 
                              onClick={handleStartFusion}
                              disabled={fusionInProgress}
                              variant={calculateCompatibility < compatibilityThreshold ? "outline" : "default"}
                            >
                              {fusionInProgress ? (
                                <>Processing...</>
                              ) : (
                                <>
                                  <Wand2 className="h-4 w-4 mr-2" />
                                  Start Fusion Process
                                </>
                              )}
                            </Button>
                            
                            {calculateCompatibility < compatibilityThreshold && (
                              <div className="mt-2 text-xs text-center text-red-500">
                                Warning: Below compatibility threshold ({compatibilityThreshold}%)
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Fusion results section */}
            <div className="mt-6">
              <Separator className="my-4" />
              <h3 className="font-medium mb-4">Recent Fusion Results</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {fusionResults.map((fusion: FusionResult) => (
                  <div key={fusion.id} className="border rounded-md p-3 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{fusion.name}</h4>
                      <Badge 
                        variant={fusion.compatibility > 85 ? "default" : "outline"}
                        className={fusion.compatibility > 85 ? "bg-green-500" : ""}
                      >
                        {fusion.compatibility}% Compatible
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{fusion.description}</p>
                    <div className="text-xs text-muted-foreground mb-2">
                      Created: {formatDate(fusion.dateCreated)}
                    </div>
                    
                    <div className="flex justify-end">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">View Details</Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-xl">
                          <DialogHeader>
                            <DialogTitle>{fusion.name}</DialogTitle>
                            <DialogDescription>
                              Fusion Result Details
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="pt-4">
                            <div className="mb-4">
                              <p className="text-muted-foreground">{fusion.description}</p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 mb-4">
                              <div className="space-y-1">
                                <div className="text-sm font-medium">Compatibility</div>
                                <div className="flex items-center gap-2">
                                  <Progress value={fusion.compatibility} className="h-2" />
                                  <span className="text-sm">{fusion.compatibility}%</span>
                                </div>
                              </div>
                              
                              <div className="space-y-1">
                                <div className="text-sm font-medium">Created</div>
                                <div className="text-sm">{formatDate(fusion.dateCreated)}</div>
                              </div>
                            </div>
                            
                            <div className="mb-4">
                              <div className="text-sm font-medium mb-2">Source Data</div>
                              <div className="border rounded-md p-2 bg-muted/50">
                                <ul className="text-sm space-y-1">
                                  {fusion.sourceDataIds.map((id: string) => {
                                    const source = realityData.find(item => item.id === id);
                                    return source ? (
                                      <li key={id} className="flex items-center gap-2">
                                        {getRealityIcon(source.type)}
                                        <span>{source.name}</span>
                                      </li>
                                    ) : null;
                                  })}
                                </ul>
                              </div>
                            </div>
                            
                            <div className="text-sm text-center text-muted-foreground">
                              This fusion result can be used in projects as a combined resource.
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Fusion progress dialog */}
      <Dialog open={fusionInProgress} onOpenChange={(open) => {
        if (!open && !showResult) setFusionInProgress(false);
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Fusion in Progress</DialogTitle>
            <DialogDescription>
              Combining {selectedItems.length} reality elements...
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-6">
            <Progress value={progressValue} className="h-2 mb-2" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Processing Data</span>
              <span>{Math.round(progressValue)}%</span>
            </div>
            
            <div className="mt-4 space-y-2">
              {selectedRealityData.map((item: RealityData, index: number) => (
                <div key={item.id} className="flex items-center gap-2">
                  {getRealityIcon(item.type)}
                  <div className="flex-1 text-sm">{item.name}</div>
                  <Badge 
                    variant="outline" 
                    className={progressValue > (index + 1) / selectedItems.length * 100 ? "bg-green-500 text-white border-green-500" : ""}
                  >
                    {progressValue > (index + 1) / selectedItems.length * 100 ? "Processed" : "Waiting"}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Fusion result dialog */}
      <Dialog open={showResult} onOpenChange={setShowResult}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Fusion Complete</DialogTitle>
            <DialogDescription>
              Reality fusion process completed successfully
            </DialogDescription>
          </DialogHeader>
          
          {currentFusion && (
            <div className="pt-4">
              <div className="rounded-lg border p-4 mb-4 bg-primary/5">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-5 w-5 text-primary" />
                    <h3 className="font-medium">{currentFusion.name}</h3>
                  </div>
                  <Badge>{currentFusion.compatibility}% Compatible</Badge>
                </div>
                
                <p className="text-sm text-muted-foreground mb-4">{currentFusion.description}</p>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-sm font-medium mb-1">Source Elements:</div>
                    <div className="text-sm">
                      {currentFusion.sourceDataIds.length} elements combined
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium mb-1">Created:</div>
                    <div className="text-sm">
                      {formatDate(currentFusion.dateCreated)}
                    </div>
                  </div>
                </div>
                
                <div className="rounded-md bg-muted/50 p-3 border text-sm">
                  <div className="font-medium mb-2">Fusion Notes:</div>
                  <p className="text-muted-foreground">
                    This fusion has been optimized for compatibility across multiple reality layers.
                    It can be accessed in projects via the resource manager.
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline"
                  onClick={() => {
                    setShowResult(false);
                    clearSelection();
                  }}
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    if (currentFusion) {
                      // Get random coordinates within a reasonable range in the universe
                      const randomPosition = {
                        x: -10 + Math.random() * 20,
                        y: -5 + Math.random() * 10,
                        z: -10 + Math.random() * 20
                      };
                      
                      // Create a universe node from the fusion
                      const { addNode } = useGame.getState();
                      
                      // Add the node to the universe
                      addNode({
                        id: currentFusion.id,
                        type: "fusion",
                        name: currentFusion.name,
                        position: randomPosition,
                        scale: 1.5, // Slightly larger than normal nodes
                        color: "#7c3aed", // Purple for fusion nodes
                        connections: [],
                        dateCreated: currentFusion.dateCreated,
                        lastModified: new Date().toISOString(),
                        metadata: {
                          description: currentFusion.description,
                          compatibility: currentFusion.compatibility,
                          sourceDataIds: currentFusion.sourceDataIds
                        }
                      });
                      
                      // Play success sound and notify user
                      playSuccess();
                      setShowResult(false);
                      clearSelection();
                      addNotification({
                        title: "Fusion Exported",
                        message: "The fusion result has been exported to the universe as a node.",
                        type: "success",
                        priority: "medium",
                        source: "Reality Fusion"
                      });
                    }
                  }}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Export to Projects
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}