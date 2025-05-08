import React, { useState } from "react";
import { Layers, Cpu, Video, Music, Code, FileText, Upload, RefreshCw, X, Check, AlertTriangle } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { useAudio } from "../lib/stores/useAudio";
import { useGame } from "../lib/stores/useGame";
import { useNotifications } from "../lib/stores/useNotifications";

// Define the types of reality data
type RealityType = "model" | "video" | "audio" | "code" | "text";

// Interface for reality data objects
interface RealityData {
  id: string;
  name: string;
  type: RealityType;
  description: string;
  dateCreated: string;
  size: string;
  tags: string[];
  thumbnail?: string;
}

// Interface for fusion result
interface FusionResult {
  id: string;
  name: string;
  description: string;
  sourceDataIds: string[];
  dateCreated: string;
  type: "fusion";
  compatibility: number; // 0-100 score
  status: "pending" | "processing" | "complete" | "failed";
  previewImage?: string;
}

// Mock data for available reality data
const mockRealityData: RealityData[] = [
  {
    id: "model1",
    name: "Celestial Navigation Core",
    type: "model",
    description: "3D model of the navigation interface core structure",
    dateCreated: "2025-04-15",
    size: "24.5 MB",
    tags: ["navigation", "core", "interface"],
    thumbnail: "/images/model-thumbnail-1.jpg"
  },
  {
    id: "model2",
    name: "Project Node Representation",
    type: "model",
    description: "3D model for project nodes in the universe view",
    dateCreated: "2025-04-18",
    size: "12.8 MB",
    tags: ["node", "project", "universe"],
    thumbnail: "/images/model-thumbnail-2.jpg"
  },
  {
    id: "video1",
    name: "Multiversal Grid Animation",
    type: "video",
    description: "Animation showing the dynamic multiversal grid system",
    dateCreated: "2025-04-20",
    size: "45.2 MB",
    tags: ["animation", "grid", "system"],
    thumbnail: "/images/video-thumbnail-1.jpg"
  },
  {
    id: "audio1",
    name: "Neural Ambient Soundtrack",
    type: "audio",
    description: "Ambient sounds generated based on neural activity",
    dateCreated: "2025-04-22",
    size: "8.7 MB",
    tags: ["ambient", "neural", "soundtrack"],
    thumbnail: "/images/audio-thumbnail-1.jpg"
  },
  {
    id: "code1",
    name: "Reality Fusion Algorithm",
    type: "code",
    description: "Core algorithm implementation for reality fusion",
    dateCreated: "2025-04-25",
    size: "156 KB",
    tags: ["algorithm", "fusion", "core"],
    thumbnail: "/images/code-thumbnail-1.jpg"
  },
  {
    id: "text1",
    name: "Fusion Theory Documentation",
    type: "text",
    description: "Theoretical framework for reality fusion processes",
    dateCreated: "2025-04-10",
    size: "320 KB",
    tags: ["documentation", "theory", "process"],
    thumbnail: "/images/text-thumbnail-1.jpg"
  }
];

// Mock data for past fusions
const mockPastFusions: FusionResult[] = [
  {
    id: "fusion1",
    name: "Interactive Navigation Model",
    description: "Combined 3D model with code for interactive navigation",
    sourceDataIds: ["model1", "code1"],
    dateCreated: "2025-04-26",
    type: "fusion",
    compatibility: 92,
    status: "complete",
    previewImage: "/images/fusion-result-1.jpg"
  },
  {
    id: "fusion2",
    name: "Audiovisual Experience",
    description: "Video animation with synchronized neural audio",
    sourceDataIds: ["video1", "audio1"],
    dateCreated: "2025-04-28",
    type: "fusion",
    compatibility: 88,
    status: "complete",
    previewImage: "/images/fusion-result-2.jpg"
  }
];

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
export function RealityFusion() {
  const [selectedItems, setSelectedItems] = useState<RealityData[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [fusionInProgress, setFusionInProgress] = useState<boolean>(false);
  const [progressValue, setProgressValue] = useState<number>(0);
  const [currentFusion, setCurrentFusion] = useState<FusionResult | null>(null);
  const [fusions, setFusions] = useState<FusionResult[]>(mockPastFusions);
  const [showResult, setShowResult] = useState<boolean>(false);
  
  const { playSuccess, playError, playNotification } = useAudio();
  const { recordInteraction } = useGame();
  const { addNotification } = useNotifications();
  
  // Filter data based on active tab
  const filteredData = activeTab === "all" 
    ? mockRealityData 
    : mockRealityData.filter(item => item.type === activeTab);
    
  // Handle selecting an item
  const handleSelectItem = (item: RealityData) => {
    recordInteraction();
    playNotification();
    
    if (selectedItems.find(selected => selected.id === item.id)) {
      setSelectedItems(selectedItems.filter(selected => selected.id !== item.id));
    } else {
      setSelectedItems([...selectedItems, item]);
    }
  };
  
  // Check if an item is selected
  const isSelected = (itemId: string) => {
    return selectedItems.some(item => item.id === itemId);
  };
  
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
        
        // Create a new fusion result
        const newFusion: FusionResult = {
          id: `fusion${fusions.length + 1}`,
          name: `Fusion ${selectedItems.map(item => item.type.charAt(0).toUpperCase() + item.type.slice(1)).join("-")}`,
          description: `Combined ${selectedItems.map(item => item.type).join(" and ")} for enhanced interaction`,
          sourceDataIds: selectedItems.map(item => item.id),
          dateCreated: new Date().toISOString().split("T")[0],
          type: "fusion",
          compatibility: Math.floor(70 + Math.random() * 30), // Random between 70-100
          status: "complete",
          previewImage: "/images/fusion-result-new.jpg"
        };
        
        setCurrentFusion(newFusion);
        setFusions([newFusion, ...fusions]);
        
        // Complete the process
        setTimeout(() => {
          setFusionInProgress(false);
          setShowResult(true);
          playSuccess();
          addNotification({
            title: "Fusion Complete",
            message: `Reality fusion process completed successfully with ${newFusion.compatibility}% compatibility.`,
            type: "success",
            priority: "high",
            source: "Reality Fusion"
          });
        }, 500);
      }
      setProgressValue(progress);
    }, 200);
  };
  
  // Handle clearing selection
  const handleClearSelection = () => {
    setSelectedItems([]);
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
            <div className="flex gap-4">
              {/* Reality data grid */}
              <div className="flex-1">
                <ScrollArea className="h-[400px] rounded-md border">
                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredData.map((item) => (
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
                          {item.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-[10px]">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
              
              {/* Selection and controls */}
              <div className="w-72 border rounded-md p-4 flex flex-col">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium">Selected Items</h3>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    disabled={selectedItems.length === 0}
                    onClick={handleClearSelection}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                {selectedItems.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center text-muted-foreground p-4">
                    <Layers className="h-10 w-10 mb-2 opacity-20" />
                    <p className="text-sm">Select at least two items to begin the fusion process</p>
                  </div>
                ) : (
                  <ScrollArea className="flex-1 mb-4">
                    <div className="space-y-2">
                      {selectedItems.map((item) => (
                        <div 
                          key={item.id}
                          className="flex items-center gap-2 p-2 rounded-md bg-background border"
                        >
                          {getRealityIcon(item.type)}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">{item.name}</div>
                            <div className="text-xs text-muted-foreground">{item.type}</div>
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
                )}
                
                {selectedItems.length >= 2 && (
                  <div className="mt-auto">
                    <div className="text-sm text-muted-foreground mb-2">
                      {selectedItems.length === 2 ? (
                        <div className="flex items-center gap-1">
                          <Check className="h-4 w-4 text-green-500" />
                          <span>Compatible data types</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                          <span>Complex fusion (may reduce compatibility)</span>
                        </div>
                      )}
                    </div>
                    
                    <Button 
                      className="w-full" 
                      onClick={handleStartFusion}
                      disabled={fusionInProgress}
                    >
                      {fusionInProgress ? (
                        <>Processing...</>
                      ) : (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Start Fusion
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Fusion results section */}
            <div className="mt-6">
              <Separator className="my-4" />
              <h3 className="font-medium mb-4">Recent Fusion Results</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {fusions.map((fusion) => (
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
                                  {fusion.sourceDataIds.map((id) => {
                                    const source = mockRealityData.find(item => item.id === id);
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
              {selectedItems.map((item, index) => (
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
                    setSelectedItems([]);
                  }}
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    playSuccess();
                    setShowResult(false);
                    setSelectedItems([]);
                    addNotification({
                      title: "Fusion Exported",
                      message: "The fusion result has been exported to your project resources.",
                      type: "success",
                      priority: "medium",
                      source: "Reality Fusion"
                    });
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

export default RealityFusion;