import React, { useState, useEffect } from "react";
import { Activity, Server, HardDrive, Clock, Cpu, Signal, Database, Cloud, FileDown, FileUp, Wifi, WifiOff } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAudio } from "@/lib/stores/useAudio";
import { useNotifications } from "@/lib/stores/useNotifications";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Types for system status data
interface SystemMetric {
  name: string;
  value: number;
  unit: string;
  status: "normal" | "warning" | "critical";
  icon: React.ReactNode;
}

interface SystemStatus {
  cpu: SystemMetric;
  memory: SystemMetric;
  storage: SystemMetric;
  network: {
    status: "online" | "offline" | "degraded";
    latency: SystemMetric;
    download: SystemMetric;
    upload: SystemMetric;
  };
  uptime: SystemMetric;
  activeUsers: number;
  activeSessions: number;
  database: {
    status: "normal" | "warning" | "critical";
    queries: number;
    connections: number;
  };
  events: SystemEvent[];
}

interface SystemEvent {
  id: string;
  timestamp: Date;
  type: "info" | "warning" | "error" | "success";
  message: string;
  source: string;
}

// Mock function to simulate real metrics (in a real app, these would come from actual monitoring)
const getSystemMetrics = (): SystemStatus => {
  // Helper to generate slightly varying values on each call
  const randomVariation = (base: number, variationPercent: number): number => {
    const variation = base * (variationPercent / 100);
    return base + (Math.random() * variation * 2) - variation;
  };
  
  // CPU usage varies between 15-60%
  const cpuUsage = Math.round(randomVariation(30, 20));
  const cpuStatus = cpuUsage > 80 ? "critical" : cpuUsage > 60 ? "warning" : "normal";
  
  // Memory usage varies between 40-75%
  const memoryUsage = Math.round(randomVariation(55, 15));
  const memoryStatus = memoryUsage > 85 ? "critical" : memoryUsage > 70 ? "warning" : "normal";
  
  // Storage usage varies between 35-65%
  const storageUsage = Math.round(randomVariation(50, 10));
  const storageStatus = storageUsage > 90 ? "critical" : storageUsage > 75 ? "warning" : "normal";
  
  // Network latency varies between 10-150ms
  const latency = Math.round(randomVariation(35, 30));
  const latencyStatus = latency > 100 ? "critical" : latency > 50 ? "warning" : "normal";
  
  // Whether we're online or not
  const networkStatus = Math.random() > 0.05 ? "online" : Math.random() > 0.5 ? "degraded" : "offline";
  
  // Generate a few system events
  const eventTypes: ("info" | "warning" | "error" | "success")[] = ["info", "warning", "error", "success"];
  const eventSources = ["System", "Network", "Storage", "Security", "User", "Database"];
  
  const events: SystemEvent[] = Array.from({ length: 10 }, (_, i) => {
    const type = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    const source = eventSources[Math.floor(Math.random() * eventSources.length)];
    
    let message = "";
    switch (type) {
      case "info":
        message = `${source} status update: normal operation`;
        break;
      case "warning":
        message = `${source} utilization approaching threshold`;
        break;
      case "error":
        message = `${source} error: resource constraint detected`;
        break;
      case "success":
        message = `${source} optimization complete`;
        break;
    }
    
    return {
      id: `event-${i}`,
      timestamp: new Date(Date.now() - Math.random() * 3600000), // Within the last hour
      type,
      message,
      source
    };
  }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()); // Most recent first
  
  return {
    cpu: {
      name: "CPU Usage",
      value: cpuUsage,
      unit: "%",
      status: cpuStatus,
      icon: <Cpu className="h-4 w-4" />
    },
    memory: {
      name: "Memory Usage",
      value: memoryUsage,
      unit: "%",
      status: memoryStatus,
      icon: <HardDrive className="h-4 w-4" />
    },
    storage: {
      name: "Storage Usage",
      value: storageUsage,
      unit: "%",
      status: storageStatus,
      icon: <Database className="h-4 w-4" />
    },
    network: {
      status: networkStatus,
      latency: {
        name: "Network Latency",
        value: latency,
        unit: "ms",
        status: latencyStatus,
        icon: <Signal className="h-4 w-4" />
      },
      download: {
        name: "Download Speed",
        value: Math.round(randomVariation(5.5, 20) * 10) / 10,
        unit: "MB/s",
        status: "normal",
        icon: <FileDown className="h-4 w-4" />
      },
      upload: {
        name: "Upload Speed",
        value: Math.round(randomVariation(1.2, 15) * 10) / 10,
        unit: "MB/s",
        status: "normal",
        icon: <FileUp className="h-4 w-4" />
      }
    },
    uptime: {
      name: "System Uptime",
      value: Math.round(randomVariation(4.5, 5) * 10) / 10,
      unit: "hours",
      status: "normal",
      icon: <Clock className="h-4 w-4" />
    },
    activeUsers: Math.floor(randomVariation(8, 50)),
    activeSessions: Math.floor(randomVariation(12, 40)),
    database: {
      status: Math.random() > 0.9 ? "warning" : "normal",
      queries: Math.floor(randomVariation(450, 30)),
      connections: Math.floor(randomVariation(12, 20))
    },
    events
  };
};

// Format uptime
const formatUptime = (hours: number): string => {
  const days = Math.floor(hours / 24);
  const remainingHours = Math.floor(hours % 24);
  const minutes = Math.floor((hours * 60) % 60);
  
  if (days > 0) {
    return `${days}d ${remainingHours}h ${minutes}m`;
  }
  return `${remainingHours}h ${minutes}m`;
};

// Main component
const SystemStatus: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [systemData, setSystemData] = useState<SystemStatus | null>(null);
  const [refreshInterval, setRefreshInterval] = useState<number | null>(null);
  const { playNotification } = useAudio();
  const { addNotification } = useNotifications();
  
  // Load initial system data
  useEffect(() => {
    if (isOpen && !systemData) {
      const data = getSystemMetrics();
      setSystemData(data);
      
      // Check for any critical metrics
      const hasCritical = data.cpu.status === "critical" || 
                          data.memory.status === "critical" || 
                          data.storage.status === "critical" ||
                          data.network.latency.status === "critical";
      
      if (hasCritical) {
        addNotification({
          title: "System Alert",
          message: "Critical system metrics detected. Check system status for details.",
          type: "error",
          priority: "high",
          source: "System Monitor"
        });
      }
    }
  }, [isOpen, systemData, addNotification]);
  
  // Setup refresh interval when dialog is open
  useEffect(() => {
    if (isOpen && !refreshInterval) {
      const interval = window.setInterval(() => {
        setSystemData(getSystemMetrics());
      }, 5000); // Refresh every 5 seconds
      
      setRefreshInterval(interval);
    } else if (!isOpen && refreshInterval) {
      clearInterval(refreshInterval);
      setRefreshInterval(null);
    }
    
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [isOpen, refreshInterval]);
  
  // Handle opening the status dialog
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      playNotification();
    }
  };
  
  // Render status badge based on status
  const renderStatusBadge = (status: string) => {
    let variant: "default" | "secondary" | "destructive" | "outline" = "default";
    let label = status;
    
    switch (status) {
      case "normal":
        variant = "default";
        label = "Normal";
        break;
      case "warning":
        variant = "secondary";
        label = "Warning";
        break;
      case "critical":
        variant = "destructive";
        label = "Critical";
        break;
      case "online":
        variant = "default";
        label = "Online";
        break;
      case "offline":
        variant = "destructive";
        label = "Offline";
        break;
      case "degraded":
        variant = "secondary";
        label = "Degraded";
        break;
    }
    
    return <Badge variant={variant}>{label}</Badge>;
  };
  
  // Render progress indicator based on status
  const renderProgress = (metric: SystemMetric) => {
    let color = "bg-primary";
    
    if (metric.status === "warning") {
      color = "bg-yellow-500";
    } else if (metric.status === "critical") {
      color = "bg-destructive";
    }
    
    return (
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {metric.icon}
            <span className="text-sm">{metric.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {metric.value}{metric.unit}
            </span>
            {renderStatusBadge(metric.status)}
          </div>
        </div>
        <Progress value={metric.unit === "%" ? metric.value : 0} className={color} />
      </div>
    );
  };
  
  // Render each event with appropriate styling
  const renderEvent = (event: SystemEvent) => {
    let iconColor = "text-blue-500";
    let icon = <Info className="h-4 w-4" />;
    
    switch (event.type) {
      case "info":
        iconColor = "text-blue-500";
        icon = <Info className="h-4 w-4" />;
        break;
      case "warning":
        iconColor = "text-yellow-500";
        icon = <AlertTriangle className="h-4 w-4" />;
        break;
      case "error":
        iconColor = "text-red-500";
        icon = <AlertOctagon className="h-4 w-4" />;
        break;
      case "success":
        iconColor = "text-green-500";
        icon = <CheckCircle className="h-4 w-4" />;
        break;
    }
    
    return (
      <div key={event.id} className="py-2 border-b last:border-b-0">
        <div className="flex items-start gap-2">
          <div className={iconColor}>{icon}</div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{event.source}</span>
              <span className="text-xs text-muted-foreground">
                {event.timestamp.toLocaleTimeString()}
              </span>
            </div>
            <p className="text-sm mt-1">{event.message}</p>
          </div>
        </div>
      </div>
    );
  };
  
  // Helper components for icons
  const Info = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
  
  const AlertTriangle = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
  
  const AlertOctagon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M7.86 2h8.28L22 7.86v8.28L16.14 22H7.86L2 16.14V7.86L7.86 2z" />
      <path d="M12 8v4" />
      <path d="M12 16h.01" />
    </svg>
  );
  
  const CheckCircle = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <path d="m9 11 3 3L22 4" />
    </svg>
  );
  
  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="fixed left-4 top-16 z-50 rounded-full p-2 bg-black/40 text-white hover:bg-black/60"
          aria-label="System Status"
        >
          <Activity className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Server className="h-5 w-5 text-primary" />
            NEXUSFORGE OS System Status
          </DialogTitle>
          <DialogDescription>
            Real-time system metrics and performance data
          </DialogDescription>
        </DialogHeader>
        
        {systemData ? (
          <Tabs defaultValue="overview" className="mt-4">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="events">System Events</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 p-4 border rounded-lg">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <Server className="h-4 w-4 text-blue-500" />
                    System Status
                  </h3>
                  <div className="space-y-4 mt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Overall Status</span>
                      {systemData.network.status === "online" && systemData.cpu.status !== "critical" && systemData.memory.status !== "critical" ? (
                        <Badge variant="default">Healthy</Badge>
                      ) : systemData.network.status === "offline" ? (
                        <Badge variant="destructive">Offline</Badge>
                      ) : (
                        <Badge variant="secondary">Degraded</Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Network Status</span>
                      <div className="flex items-center gap-2">
                        {systemData.network.status === "online" ? (
                          <Wifi className="h-4 w-4 text-green-500" />
                        ) : (
                          <WifiOff className="h-4 w-4 text-red-500" />
                        )}
                        {renderStatusBadge(systemData.network.status)}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Database Status</span>
                      {renderStatusBadge(systemData.database.status)}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Uptime</span>
                      <span className="text-sm font-medium">{formatUptime(systemData.uptime.value)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 p-4 border rounded-lg">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <Activity className="h-4 w-4 text-purple-500" />
                    Activity
                  </h3>
                  <div className="space-y-4 mt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Active Users</span>
                      <span className="text-sm font-medium">{systemData.activeUsers}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Active Sessions</span>
                      <span className="text-sm font-medium">{systemData.activeSessions}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Database Queries</span>
                      <span className="text-sm font-medium">{systemData.database.queries}/min</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Database Connections</span>
                      <span className="text-sm font-medium">{systemData.database.connections}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2 p-4 border rounded-lg">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Cloud className="h-4 w-4 text-cyan-500" />
                  Resource Utilization
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                  <div className="space-y-4">
                    {renderProgress(systemData.cpu)}
                    {renderProgress(systemData.memory)}
                  </div>
                  <div className="space-y-4">
                    {renderProgress(systemData.storage)}
                    {renderProgress(systemData.network.latency)}
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="performance" className="space-y-4 py-4">
              <div className="space-y-2 p-4 border rounded-lg">
                <h3 className="text-sm font-semibold">Detailed Performance Metrics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                  <div className="space-y-4">
                    {renderProgress(systemData.cpu)}
                    {renderProgress(systemData.memory)}
                    {renderProgress(systemData.storage)}
                  </div>
                  <div className="space-y-4">
                    {renderProgress(systemData.network.latency)}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          {systemData.network.download.icon}
                          <span className="text-sm">{systemData.network.download.name}</span>
                        </div>
                        <span className="text-sm font-medium">
                          {systemData.network.download.value} {systemData.network.download.unit}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          {systemData.network.upload.icon}
                          <span className="text-sm">{systemData.network.upload.name}</span>
                        </div>
                        <span className="text-sm font-medium">
                          {systemData.network.upload.value} {systemData.network.upload.unit}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 p-4 border rounded-lg">
                  <h3 className="text-sm font-semibold">Database Performance</h3>
                  <div className="space-y-3 mt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Status</span>
                      {renderStatusBadge(systemData.database.status)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Query Rate</span>
                      <span className="text-sm font-medium">{systemData.database.queries}/min</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Active Connections</span>
                      <span className="text-sm font-medium">{systemData.database.connections}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 p-4 border rounded-lg">
                  <h3 className="text-sm font-semibold">System Information</h3>
                  <div className="space-y-3 mt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Uptime</span>
                      <span className="text-sm font-medium">{formatUptime(systemData.uptime.value)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Version</span>
                      <span className="text-sm font-medium">NEXUSFORGE OS v1.2.4</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Last Update</span>
                      <span className="text-sm font-medium">Today, 09:45 AM</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="events" className="py-4">
              <div className="p-4 border rounded-lg">
                <h3 className="text-sm font-semibold mb-2">Recent System Events</h3>
                <ScrollArea className="h-[50vh] pr-4">
                  <div className="space-y-1">
                    {systemData.events.map(renderEvent)}
                  </div>
                </ScrollArea>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin mr-2">
              <Activity className="h-5 w-5" />
            </div>
            <span>Loading system data...</span>
          </div>
        )}
        
        <DialogFooter className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
          <Button onClick={() => setSystemData(getSystemMetrics())}>
            Refresh
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SystemStatus;