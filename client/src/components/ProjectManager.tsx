import React, { useState } from "react";
import { useProjects } from "@/lib/stores/useProjects";
import { Project, ProjectType } from "@shared/types";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useAudio } from "@/lib/stores/useAudio";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";

const ProjectManager: React.FC = () => {
  const { 
    projects, 
    selectedProject, 
    addProject, 
    updateProject, 
    deleteProject,
    selectProject
  } = useProjects();
  
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [projectFormData, setProjectFormData] = useState<Partial<Project>>({
    title: "",
    description: "",
    type: "video" as ProjectType,
    relatedProjects: []
  });
  const [activeTab, setActiveTab] = useState<string>("all");
  const { playHit, playSuccess } = useAudio();
  
  // Filter projects by type
  const filteredProjects = React.useMemo(() => {
    if (activeTab === "all") return projects;
    return projects.filter(project => project.type === activeTab);
  }, [projects, activeTab]);
  
  // Handle form submission for creating/editing projects
  const handleSubmitProject = () => {
    if (!projectFormData.title || !projectFormData.description) return;
    
    if (projectFormData.id) {
      // Update existing project
      updateProject({
        ...projectFormData as Project,
        updatedAt: new Date().toISOString()
      });
      playSuccess();
    } else {
      // Create new project
      addProject({
        ...projectFormData as Omit<Project, "id" | "createdAt" | "updatedAt">,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      playHit();
    }
    
    // Reset form and close dialog
    setProjectFormData({
      title: "",
      description: "",
      type: "video",
      relatedProjects: []
    });
    setProjectDialogOpen(false);
  };
  
  // Handle editing a project
  const handleEditProject = (project: Project) => {
    setProjectFormData(project);
    setProjectDialogOpen(true);
  };
  
  // Handle deleting a project
  const handleDeleteProject = (projectId: string) => {
    deleteProject(projectId);
    playHit();
  };
  
  // Handle toggling related projects
  const toggleRelatedProject = (projectId: string) => {
    setProjectFormData(prev => {
      const relatedProjects = prev.relatedProjects || [];
      if (relatedProjects.includes(projectId)) {
        return {
          ...prev,
          relatedProjects: relatedProjects.filter(id => id !== projectId)
        };
      } else {
        return {
          ...prev,
          relatedProjects: [...relatedProjects, projectId]
        };
      }
    });
  };
  
  return (
    <div className="absolute top-24 right-6 w-96 h-[calc(100vh-180px)] bg-black/60 backdrop-blur-sm rounded-lg border border-gray-700 p-4 flex flex-col overflow-hidden">
      <h2 className="text-2xl font-bold text-cyan-400 mb-2">Project Manager</h2>
      <p className="text-gray-300 text-sm mb-4">
        Organize and manage your creative projects
      </p>
      
      {/* Project type filters */}
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="mb-4"
      >
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="video">Video</TabsTrigger>
          <TabsTrigger value="model">Model</TabsTrigger>
          <TabsTrigger value="audio">Audio</TabsTrigger>
          <TabsTrigger value="code">Code</TabsTrigger>
        </TabsList>
      </Tabs>
      
      {/* Project list */}
      <ScrollArea className="flex-1 pr-3">
        <div className="space-y-3">
          {filteredProjects.length > 0 ? (
            filteredProjects.map(project => (
              <Card 
                key={project.id} 
                className={`p-3 hover:shadow-lg transition-all cursor-pointer bg-gray-900/80 border-gray-700 ${
                  selectedProject?.id === project.id ? "border-cyan-500" : ""
                }`}
                onClick={() => selectProject(project.id)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: 
                          project.type === "video" ? "#f04a4a" : 
                          project.type === "model" ? "#4af04a" : 
                          project.type === "audio" ? "#f0e54a" : 
                          "#4a9df0" 
                        }}
                      ></div>
                      <h3 className="text-white font-bold">{project.title}</h3>
                    </div>
                    <p className="text-gray-400 text-sm mt-1 line-clamp-2">{project.description}</p>
                    
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {project.type}
                      </Badge>
                      {project.relatedProjects && project.relatedProjects.length > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {project.relatedProjects.length} connections
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-6 px-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditProject(project);
                      }}
                    >
                      Edit
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-6 px-2 text-red-500 hover:text-red-400 hover:bg-red-950"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteProject(project.id);
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-8 text-gray-400">
              No projects found. Create your first project to get started.
            </div>
          )}
        </div>
      </ScrollArea>
      
      {/* Create new project button */}
      <Button
        className="mt-4 bg-cyan-600 hover:bg-cyan-700 w-full"
        onClick={() => {
          setProjectFormData({
            title: "",
            description: "",
            type: "video",
            relatedProjects: []
          });
          setProjectDialogOpen(true);
        }}
      >
        Create New Project
      </Button>
      
      {/* Project creation/editing dialog */}
      <Dialog open={projectDialogOpen} onOpenChange={setProjectDialogOpen}>
        <DialogContent className="bg-gray-900 text-white border-gray-700">
          <DialogHeader>
            <DialogTitle>
              {projectFormData.id ? "Edit Project" : "Create New Project"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-300 mb-1 block">
                Project Title
              </label>
              <Input
                value={projectFormData.title || ""}
                onChange={(e) => setProjectFormData({...projectFormData, title: e.target.value})}
                placeholder="Enter project title"
                className="bg-gray-800 border-gray-700"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-300 mb-1 block">
                Project Type
              </label>
              <Select 
                value={projectFormData.type}
                onValueChange={(value) => setProjectFormData({...projectFormData, type: value as ProjectType})}
              >
                <SelectTrigger className="bg-gray-800 border-gray-700">
                  <SelectValue placeholder="Select project type" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="model">3D Model</SelectItem>
                  <SelectItem value="audio">Audio</SelectItem>
                  <SelectItem value="code">Code</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-300 mb-1 block">
                Description
              </label>
              <Textarea
                value={projectFormData.description || ""}
                onChange={(e) => setProjectFormData({...projectFormData, description: e.target.value})}
                placeholder="Enter project description"
                className="resize-none h-24 bg-gray-800 border-gray-700"
              />
            </div>
            
            {projects.length > 0 && (
              <div>
                <label className="text-sm font-medium text-gray-300 mb-1 block">
                  Related Projects
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                  {projects
                    .filter(p => !projectFormData.id || p.id !== projectFormData.id)
                    .map(project => (
                      <div 
                        key={project.id}
                        className="flex items-center"
                      >
                        <input
                          type="checkbox"
                          id={`related-${project.id}`}
                          checked={(projectFormData.relatedProjects || []).includes(project.id)}
                          onChange={() => toggleRelatedProject(project.id)}
                          className="mr-2 h-4 w-4"
                        />
                        <label 
                          htmlFor={`related-${project.id}`}
                          className="text-sm text-gray-300 flex items-center"
                        >
                          <div 
                            className="w-2 h-2 rounded-full mr-2"
                            style={{ backgroundColor: 
                              project.type === "video" ? "#f04a4a" : 
                              project.type === "model" ? "#4af04a" : 
                              project.type === "audio" ? "#f0e54a" : 
                              "#4a9df0" 
                            }}
                          ></div>
                          {project.title}
                        </label>
                      </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setProjectDialogOpen(false)}
                className="border-gray-700 text-gray-300"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmitProject}
                className="bg-cyan-600 hover:bg-cyan-700"
                disabled={!projectFormData.title || !projectFormData.description}
              >
                {projectFormData.id ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectManager;
