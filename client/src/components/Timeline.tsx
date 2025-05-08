import React, { useEffect, useState } from "react";
import { useProjects } from "@/lib/stores/useProjects";
import { Project } from "@shared/types";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { Card } from "./ui/card";

const Timeline: React.FC = () => {
  const { projects, selectedProject, selectProject } = useProjects();
  const [timelineProjects, setTimelineProjects] = useState<Project[]>([]);
  const [timeScale, setTimeScale] = useState<"day" | "week" | "month" | "year">("month");
  
  // Organize projects by time scale
  useEffect(() => {
    setTimelineProjects([...projects].sort((a, b) => {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }));
  }, [projects]);
  
  // Group projects by time period
  const groupedProjects = React.useMemo(() => {
    const groups: { [key: string]: Project[] } = {};
    
    timelineProjects.forEach(project => {
      const date = new Date(project.createdAt);
      let groupKey: string;
      
      switch (timeScale) {
        case "day":
          groupKey = date.toISOString().split('T')[0];
          break;
        case "week":
          const startOfWeek = new Date(date);
          startOfWeek.setDate(date.getDate() - date.getDay());
          groupKey = startOfWeek.toISOString().split('T')[0];
          break;
        case "year":
          groupKey = date.getFullYear().toString();
          break;
        case "month":
        default:
          groupKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(project);
    });
    
    return groups;
  }, [timelineProjects, timeScale]);
  
  // Format the time period for display
  const formatTimePeriod = (key: string): string => {
    switch (timeScale) {
      case "day":
        return new Date(key).toLocaleDateString();
      case "week":
        const startDate = new Date(key);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
      case "year":
        return key;
      case "month":
      default:
        const [year, month] = key.split('-');
        return new Date(parseInt(year), parseInt(month) - 1, 1).toLocaleDateString(undefined, { year: 'numeric', month: 'long' });
    }
  };
  
  return (
    <div className="absolute inset-0 w-full h-full bg-black/50 backdrop-blur-sm p-6 overflow-auto">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-cyan-400 mb-4">ChronoWeave Timeline</h2>
        <p className="text-gray-300 mb-6">
          Track your creative journey through time and see how your projects influence each other
        </p>
        
        {/* Time scale selector */}
        <div className="flex space-x-2 mb-6">
          <Button 
            variant={timeScale === "day" ? "default" : "outline"} 
            onClick={() => setTimeScale("day")}
            className={cn("border-cyan-500", timeScale === "day" && "bg-cyan-700")}
          >
            Day
          </Button>
          <Button 
            variant={timeScale === "week" ? "default" : "outline"} 
            onClick={() => setTimeScale("week")}
            className={cn("border-cyan-500", timeScale === "week" && "bg-cyan-700")}
          >
            Week
          </Button>
          <Button 
            variant={timeScale === "month" ? "default" : "outline"} 
            onClick={() => setTimeScale("month")}
            className={cn("border-cyan-500", timeScale === "month" && "bg-cyan-700")}
          >
            Month
          </Button>
          <Button 
            variant={timeScale === "year" ? "default" : "outline"} 
            onClick={() => setTimeScale("year")}
            className={cn("border-cyan-500", timeScale === "year" && "bg-cyan-700")}
          >
            Year
          </Button>
        </div>
        
        {/* Timeline visualization */}
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[100px] top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-500 to-purple-500"></div>
          
          {/* Timeline periods */}
          {Object.keys(groupedProjects).map((periodKey, index) => (
            <div key={periodKey} className="relative mb-12">
              {/* Period marker */}
              <div className="absolute left-[90px] w-5 h-5 rounded-full bg-cyan-500 border-2 border-white z-10 transform -translate-x-1/2"></div>
              
              {/* Period label */}
              <div className="pl-[120px] mb-4">
                <h3 className="text-xl font-bold text-white">{formatTimePeriod(periodKey)}</h3>
              </div>
              
              {/* Projects in this period */}
              <div className="pl-[120px] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupedProjects[periodKey].map(project => (
                  <Card 
                    key={project.id} 
                    className={cn(
                      "p-4 hover:shadow-lg transition-all cursor-pointer border border-gray-700 bg-black/60",
                      selectedProject?.id === project.id && "ring-2 ring-cyan-500"
                    )}
                    onClick={() => selectProject(project.id)}
                  >
                    <div 
                      className="w-full h-2 mb-2 rounded-full" 
                      style={{ backgroundColor: 
                        project.type === "video" ? "#f04a4a" : 
                        project.type === "model" ? "#4af04a" : 
                        project.type === "audio" ? "#f0e54a" : 
                        "#4a9df0" 
                      }}
                    ></div>
                    <h4 className="text-lg font-bold text-white">{project.title}</h4>
                    <p className="text-gray-400 text-sm">{project.type}</p>
                    <p className="text-gray-300 mt-2 text-sm">{project.description.slice(0, 100)}...</p>
                    <div className="mt-3 flex justify-between items-center">
                      <span className="text-xs text-cyan-300">
                        {new Date(project.createdAt).toLocaleDateString()}
                      </span>
                      {project.relatedProjects && project.relatedProjects.length > 0 && (
                        <span className="text-xs text-purple-300">
                          {project.relatedProjects.length} connections
                        </span>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Timeline;
