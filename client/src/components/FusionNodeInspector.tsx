import React from "react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { ScrollArea } from "./ui/scroll-area";
import { Layers, ExternalLink, Database, Share2, FileBarChart2, Brain, Zap } from "lucide-react";
import { useGame, UniverseNode } from "@/lib/stores/useGame";
import { useRealityFusion, getRealityDataById } from "@/lib/stores/useRealityFusion";
import { useProjects } from "@/lib/stores/useProjects";
import { useAudio } from "@/lib/stores/useAudio";
import { useNotifications } from "@/lib/stores/useNotifications";

interface FusionNodeInspectorProps {
  nodeId: string;
  onClose: () => void;
}

export const FusionNodeInspector = ({ nodeId, onClose }: FusionNodeInspectorProps) => {
  const { universeNodes, updateNode } = useGame();
  const { realityData, getRealityDataById } = useRealityFusion();
  const { projects } = useProjects();
  const { playHit: playClick, playSuccess } = useAudio();
  const { addNotification } = useNotifications();
  
  // Find the fusion node
  const node = universeNodes.find(n => n.id === nodeId && n.type === "fusion");
  
  if (!node) {
    return (
      <div className="w-full max-w-sm bg-background border border-border rounded-lg shadow-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Node Inspector</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-8 text-center text-muted-foreground">
          <p>Node not found or not a fusion node.</p>
        </div>
      </div>
    );
  }
  
  // Format the date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Get the source data IDs from metadata
  const sourceDataIds = node.metadata?.sourceDataIds as string[] || [];
  
  // Get source data details
  const sourceData = sourceDataIds.map(id => {
    // Try to find in projects first
    const project = projects.find(p => p.id === id);
    if (project) {
      return {
        id,
        name: project.title,
        type: project.type,
        isProject: true
      };
    }
    
    // Try to find in reality data
    const realityItem = getRealityDataById(id);
    if (realityItem) {
      return {
        id,
        name: realityItem.name,
        type: realityItem.type,
        isProject: false
      };
    }
    
    return {
      id,
      name: "Unknown Source",
      type: "unknown",
      isProject: false
    };
  });
  
  // Get node details
  const compatibility = node.metadata?.compatibility || 75;
  const description = node.metadata?.description || "A fusion of multiple reality data sources";
  
  // Handle export (simulate)
  const handleExport = () => {
    playClick();
    
    // Simulate export delay
    setTimeout(() => {
      playSuccess();
      addNotification({
        title: "Export Complete",
        message: `${node.name} exported successfully.`,
        type: "success",
        priority: "medium",
        source: "Universe"
      });
    }, 800);
  };
  
  // Handle analyze (simulate)
  const handleAnalyze = () => {
    playClick();
    
    // Simulate analysis
    updateNode(node.id, {
      metadata: {
        ...node.metadata,
        analyzed: true,
        analysisResults: {
          coherence: Math.floor(Math.random() * 30) + 70, // 70-100
          complexity: Math.floor(Math.random() * 50) + 50, // 50-100
          utility: Math.floor(Math.random() * 40) + 60, // 60-100
          lastAnalyzed: new Date().toISOString()
        }
      }
    });
    
    setTimeout(() => {
      playSuccess();
      addNotification({
        title: "Analysis Complete",
        message: `${node.name} has been analyzed.`,
        type: "success",
        priority: "medium",
        source: "Universe"
      });
    }, 1500);
  };
  
  // Handle optimize (simulate)
  const handleOptimize = () => {
    playClick();
    
    // Update node with optimization
    updateNode(node.id, {
      metadata: {
        ...node.metadata,
        optimized: true,
        compatibility: Math.min(100, (node.metadata?.compatibility || 75) + 12),
        optimizationDate: new Date().toISOString()
      }
    });
    
    setTimeout(() => {
      playSuccess();
      addNotification({
        title: "Optimization Complete",
        message: `${node.name} has been optimized for better compatibility.`,
        type: "success",
        priority: "medium",
        source: "Universe"
      });
    }, 1800);
  };
  
  // Analysis data if available
  const analysisResults = node.metadata?.analysisResults;
  const isAnalyzed = node.metadata?.analyzed || false;
  const isOptimized = node.metadata?.optimized || false;
  
  return (
    <div className="w-full max-w-md bg-background border border-border rounded-lg shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-purple-500/20 to-indigo-500/20 p-4 border-b border-border">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Layers className="h-5 w-5 text-purple-500" />
              <h3 className="text-lg font-semibold">{node.name}</h3>
            </div>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <Button variant="outline" size="icon" onClick={onClose}>
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex mt-3 gap-2">
          <Badge variant="outline" className="bg-background/50 text-xs">
            Fusion Node
          </Badge>
          <Badge variant="outline" className="bg-background/50 text-xs">
            Compatibility: {compatibility}%
          </Badge>
          {isOptimized && (
            <Badge variant="outline" className="bg-background/50 text-purple-500 text-xs">
              Optimized
            </Badge>
          )}
        </div>
      </div>
      
      <div className="p-4">
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2">Source Data ({sourceData.length})</h4>
          <ScrollArea className="h-32 rounded-md border">
            <div className="p-2 space-y-1">
              {sourceData.map((source) => (
                <div key={source.id} className="flex items-center justify-between p-2 rounded bg-muted/50">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      source.type === "model" ? "bg-purple-500" :
                      source.type === "video" ? "bg-blue-500" :
                      source.type === "audio" ? "bg-green-500" :
                      source.type === "code" ? "bg-amber-500" :
                      "bg-gray-500"
                    }`} />
                    <span className="text-sm font-medium">{source.name}</span>
                  </div>
                  <Badge variant="outline" className="text-[10px]">
                    {source.isProject ? "Project" : source.type}
                  </Badge>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
        
        <Separator className="my-4" />
        
        {isAnalyzed && analysisResults && (
          <div className="space-y-3 mb-4">
            <h4 className="text-sm font-medium">Analysis Results</h4>
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-md border p-2 text-center">
                <div className="text-lg font-bold text-purple-500">{analysisResults.coherence}%</div>
                <div className="text-xs text-muted-foreground">Coherence</div>
              </div>
              <div className="rounded-md border p-2 text-center">
                <div className="text-lg font-bold text-indigo-500">{analysisResults.complexity}%</div>
                <div className="text-xs text-muted-foreground">Complexity</div>
              </div>
              <div className="rounded-md border p-2 text-center">
                <div className="text-lg font-bold text-cyan-500">{analysisResults.utility}%</div>
                <div className="text-xs text-muted-foreground">Utility</div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Last analyzed: {formatDate(analysisResults.lastAnalyzed)}
            </p>
            <Separator className="my-4" />
          </div>
        )}
        
        <div className="flex flex-col gap-2">
          <Button variant="outline" className="justify-start" onClick={handleExport}>
            <Database className="h-4 w-4 mr-2" />
            Export Fusion Data
          </Button>
          
          <Button 
            variant={isAnalyzed ? "outline" : "default"} 
            className="justify-start"
            onClick={handleAnalyze}
          >
            <FileBarChart2 className="h-4 w-4 mr-2" />
            {isAnalyzed ? "Re-analyze" : "Analyze"}
          </Button>
          
          <Button 
            variant={isOptimized ? "outline" : "default"}
            className="justify-start"
            onClick={handleOptimize}
            disabled={isOptimized && (node.metadata?.compatibility || 0) >= 99}
          >
            <Zap className="h-4 w-4 mr-2" />
            {isOptimized ? "Further Optimize" : "Optimize"}
          </Button>
          
          <Button variant="outline" className="justify-start">
            <Share2 className="h-4 w-4 mr-2" />
            Share Fusion
          </Button>
          
          <Button variant="outline" className="justify-start">
            <Brain className="h-4 w-4 mr-2" />
            Apply AI Enhancement
          </Button>
        </div>
        
        <div className="mt-4 text-xs text-muted-foreground">
          <p>Created: {formatDate(node.dateCreated)}</p>
          {node.metadata?.optimizationDate && (
            <p>Last optimized: {formatDate(node.metadata.optimizationDate)}</p>
          )}
        </div>
      </div>
    </div>
  );
};