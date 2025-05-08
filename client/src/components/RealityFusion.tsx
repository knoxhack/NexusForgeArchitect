import React, { useState, useEffect } from "react";
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
  
  // Filter data based on active tab
  const filteredData = activeTab === "all" 
    ? realityData 
    : realityData.filter(item => item.type === activeTab);
    
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
            <div className="flex gap-4">
              {/* Reality data grid */}
              <div className="flex-1">
                <ScrollArea className="h-[400px] rounded-md border">
                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredData.map((item: RealityData) => (
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
                      {selectedRealityData.map((item: RealityData) => (
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