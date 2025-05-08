import React from "react";
import { useProjects } from "@/lib/stores/useProjects";
import { Card } from "./ui/card";
import { ProjectType } from "@shared/types";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

// Helper function to get color for project type
const getProjectTypeColor = (type: ProjectType): string => {
  switch (type) {
    case "video": return "#f04a4a";
    case "model": return "#4af04a";
    case "audio": return "#f0e54a";
    case "code": return "#4a9df0";
    default: return "#888888";
  }
};

const CreatorStats: React.FC = () => {
  const { projects } = useProjects();
  
  // Calculate stats
  const totalProjects = projects.length;
  const projectsThisMonth = projects.filter(project => {
    const projectDate = new Date(project.createdAt);
    const currentDate = new Date();
    return projectDate.getMonth() === currentDate.getMonth() && 
           projectDate.getFullYear() === currentDate.getFullYear();
  }).length;
  
  const projectsByType = React.useMemo(() => {
    const counts: Record<ProjectType, number> = {
      video: 0,
      model: 0,
      audio: 0,
      code: 0
    };
    
    projects.forEach(project => {
      counts[project.type]++;
    });
    
    return Object.entries(counts).map(([type, count]) => ({
      type,
      count
    }));
  }, [projects]);
  
  const projectsOverTime = React.useMemo(() => {
    const timeline: Record<string, number> = {};
    
    // Group projects by month
    projects.forEach(project => {
      const date = new Date(project.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!timeline[monthKey]) {
        timeline[monthKey] = 0;
      }
      
      timeline[monthKey]++;
    });
    
    // Convert to array and sort chronologically
    return Object.entries(timeline)
      .map(([month, count]) => {
        const [year, monthNum] = month.split('-');
        return {
          month: `${monthNum}/${year.substring(2)}`,
          count
        };
      })
      .sort((a, b) => {
        const [aMonth, aYear] = a.month.split('/');
        const [bMonth, bYear] = b.month.split('/');
        
        if (aYear !== bYear) {
          return parseInt(aYear) - parseInt(bYear);
        }
        
        return parseInt(aMonth) - parseInt(bMonth);
      });
  }, [projects]);
  
  const projectConnections = React.useMemo(() => {
    const connections: Record<string, number> = {};
    
    // Count the number of connections for each project
    projects.forEach(project => {
      if (project.relatedProjects) {
        connections[project.id] = project.relatedProjects.length;
      }
    });
    
    // Get top 5 most connected projects
    return Object.entries(connections)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id, count]) => {
        const project = projects.find(p => p.id === id);
        return {
          name: project?.title || "Unknown",
          connections: count,
          type: project?.type || "unknown"
        };
      });
  }, [projects]);
  
  return (
    <div className="absolute inset-0 w-full h-full bg-black/50 backdrop-blur-sm p-6 overflow-auto">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-cyan-400 mb-2">Creator Neural Layer</h2>
        <p className="text-gray-300 mb-6">
          Track your creative journey, output, and patterns over time
        </p>
        
        {/* Stats overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-gray-900/80 border-gray-700">
            <h3 className="text-xl font-bold text-white mb-1">Total Projects</h3>
            <p className="text-4xl font-bold text-cyan-400">{totalProjects}</p>
          </Card>
          
          <Card className="p-6 bg-gray-900/80 border-gray-700">
            <h3 className="text-xl font-bold text-white mb-1">Projects This Month</h3>
            <p className="text-4xl font-bold text-cyan-400">{projectsThisMonth}</p>
          </Card>
          
          <Card className="p-6 bg-gray-900/80 border-gray-700">
            <h3 className="text-xl font-bold text-white mb-1">Connected Projects</h3>
            <p className="text-4xl font-bold text-cyan-400">
              {projects.filter(p => p.relatedProjects && p.relatedProjects.length > 0).length}
            </p>
          </Card>
        </div>
        
        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Projects by type */}
          <Card className="p-6 bg-gray-900/80 border-gray-700 h-80">
            <h3 className="text-xl font-bold text-white mb-4">Projects by Type</h3>
            <ResponsiveContainer width="100%" height="85%">
              <PieChart>
                <Pie
                  data={projectsByType}
                  dataKey="count"
                  nameKey="type"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ type, count }) => `${type}: ${count}`}
                >
                  {projectsByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getProjectTypeColor(entry.type as ProjectType)} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name) => [`${value} projects`, name]}
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '4px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Card>
          
          {/* Projects over time */}
          <Card className="p-6 bg-gray-900/80 border-gray-700 h-80">
            <h3 className="text-xl font-bold text-white mb-4">Projects Over Time</h3>
            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={projectsOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="month" stroke="#aaa" />
                <YAxis stroke="#aaa" />
                <Tooltip 
                  formatter={(value) => [`${value} projects`]}
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '4px' }}
                />
                <Bar dataKey="count" fill="#00b3ff" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
        
        {/* Most connected projects */}
        <Card className="p-6 bg-gray-900/80 border-gray-700 mb-8">
          <h3 className="text-xl font-bold text-white mb-4">Most Connected Projects</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={projectConnections}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis type="number" stroke="#aaa" />
              <YAxis dataKey="name" type="category" width={150} stroke="#aaa" />
              <Tooltip 
                formatter={(value, name, props) => [`${value} connections`, props.payload.name]}
                contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '4px' }}
              />
              <Bar 
                dataKey="connections" 
                nameKey="name"
                radius={[0, 4, 4, 0]}
              >
                {projectConnections.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getProjectTypeColor(entry.type as ProjectType)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
        
        {/* Suggestions */}
        <Card className="p-6 bg-gray-900/80 border-gray-700">
          <h3 className="text-xl font-bold text-white mb-4">AI Suggestions</h3>
          <div className="space-y-4">
            <div className="p-4 bg-black/40 rounded-lg border border-gray-700">
              <p className="text-cyan-300 font-medium mb-2">Creative Pattern Detected</p>
              <p className="text-gray-300">
                You tend to create more video projects on weekends. Schedule dedicated creative time on Saturday mornings for maximum productivity.
              </p>
            </div>
            
            <div className="p-4 bg-black/40 rounded-lg border border-gray-700">
              <p className="text-cyan-300 font-medium mb-2">Connection Opportunity</p>
              <p className="text-gray-300">
                Your 3D models and video projects have strong thematic links. Consider creating a unified brand style guide to strengthen these connections.
              </p>
            </div>
            
            <div className="p-4 bg-black/40 rounded-lg border border-gray-700">
              <p className="text-cyan-300 font-medium mb-2">Project Recommendation</p>
              <p className="text-gray-300">
                Based on your recent work, a project combining code and audio elements would complement your portfolio. Consider a web audio visualization.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CreatorStats;
