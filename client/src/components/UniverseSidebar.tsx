import React from "react";
import { useGame } from "@/lib/stores/useGame";
import { FusionNodeInspector } from "./FusionNodeInspector";
import { useProjects } from "@/lib/stores/useProjects";
import { Button } from "./ui/button";
import { Info, Globe, Layers, X } from "lucide-react";

interface UniverseSidebarProps {
  className?: string;
}

export const UniverseSidebar: React.FC<UniverseSidebarProps> = ({ className = "" }) => {
  const { universeNodes, selectedNodeId, selectNode } = useGame();
  const { selectedProject, selectProject } = useProjects();
  
  // If no node is selected, return null
  if (!selectedNodeId && !selectedProject) {
    return null;
  }
  
  // Check if the selected node is a fusion node
  const selectedFusionNode = selectedNodeId 
    ? universeNodes.find(node => node.id === selectedNodeId && node.type === "fusion")
    : null;
  
  // Handle closing the sidebar
  const handleClose = () => {
    if (selectedNodeId) {
      selectNode(null);
    }
    if (selectedProject) {
      selectProject(null);
    }
  };
  
  return (
    <div className={`fixed right-8 top-24 z-10 animate-in slide-in-from-right duration-300 ${className}`}>
      {selectedFusionNode && (
        <FusionNodeInspector 
          nodeId={selectedNodeId as string} 
          onClose={handleClose} 
        />
      )}
      
      {selectedProject && !selectedFusionNode && (
        <div className="w-full max-w-sm bg-background border border-border rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 p-4 border-b border-border">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Globe className="h-5 w-5 text-blue-500" />
                  <h3 className="text-lg font-semibold">{selectedProject.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground">{selectedProject.description}</p>
              </div>
              <Button variant="outline" size="icon" onClick={handleClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="p-4">
            <p className="text-sm mb-4">
              This is a project node in the universe. Projects can be connected to fusion nodes and other projects to visualize relationships.
            </p>
            
            <div className="flex flex-col gap-2">
              <Button variant="outline" className="justify-start">
                <Info className="h-4 w-4 mr-2" />
                View Project Details
              </Button>
              
              <Button variant="outline" className="justify-start">
                <Layers className="h-4 w-4 mr-2" />
                Use in Reality Fusion
              </Button>
            </div>
            
            <div className="mt-4 text-xs text-muted-foreground">
              <p>Created: {new Date(selectedProject.createdAt).toLocaleDateString()}</p>
              <p>Last updated: {new Date(selectedProject.updatedAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};