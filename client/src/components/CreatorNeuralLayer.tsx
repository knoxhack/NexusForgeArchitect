import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Activity, 
  LineChart, 
  Clock, 
  Coffee, 
  Zap, 
  AlertTriangle, 
  Sparkles,
  BookOpen,
  Coffee as Relax,
  X
} from 'lucide-react';
import { useNeuralLayer, EmotionalState, ProductivityPattern } from '@/lib/stores/useNeuralLayer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { EnhancedTooltip } from './ui/EnhancedTooltip';

type EmotionType = {
  state: EmotionalState;
  icon: React.ReactNode;
  color: string;
  label: string;
  description: string;
};

const emotionTypes: Record<EmotionalState, EmotionType> = {
  "focused": {
    state: "focused",
    icon: <Zap size={16} />,
    color: "bg-blue-500",
    label: "Focused",
    description: "Deep concentration with minimal distractions"
  },
  "creative": {
    state: "creative",
    icon: <Sparkles size={16} />,
    color: "bg-purple-500",
    label: "Creative",
    description: "Open to new ideas and making unique connections"
  },
  "overwhelmed": {
    state: "overwhelmed",
    icon: <AlertTriangle size={16} />,
    color: "bg-red-500",
    label: "Overwhelmed",
    description: "Feeling stressed or facing too many inputs"
  },
  "productive": {
    state: "productive",
    icon: <Activity size={16} />,
    color: "bg-green-500",
    label: "Productive",
    description: "Efficiently completing tasks with good momentum"
  },
  "learning": {
    state: "learning",
    icon: <BookOpen size={16} />,
    color: "bg-amber-500",
    label: "Learning",
    description: "Absorbing new information and skills"
  },
  "relaxed": {
    state: "relaxed",
    icon: <Relax size={16} />,
    color: "bg-teal-500",
    label: "Relaxed",
    description: "Calm state with reduced cognitive load"
  }
};

type PatternType = {
  pattern: ProductivityPattern;
  icon: React.ReactNode;
  label: string;
  description: string;
};

const productivityPatterns: Record<ProductivityPattern, PatternType> = {
  "morning": {
    pattern: "morning",
    icon: <Clock size={16} />,
    label: "Morning Person",
    description: "Highest productivity early in the day"
  },
  "evening": {
    pattern: "evening",
    icon: <Clock size={16} />,
    label: "Night Owl",
    description: "Peak performance in evening hours"
  },
  "steady": {
    pattern: "steady",
    icon: <Activity size={16} />,
    label: "Steady Producer",
    description: "Consistent output throughout the day"
  },
  "bursts": {
    pattern: "bursts",
    icon: <Zap size={16} />,
    label: "Burst Worker",
    description: "Intense productivity in shorter intervals"
  },
  "deep-work": {
    pattern: "deep-work",
    icon: <Brain size={16} />,
    label: "Deep Worker",
    description: "Thrives in long uninterrupted sessions"
  },
  "collaborative": {
    pattern: "collaborative",
    icon: <Sparkles size={16} />,
    label: "Collaborative",
    description: "Most productive when working with others"
  }
};

export function CreatorNeuralLayer() {
  const {
    currentEmotionalState,
    dominantProductivityPattern,
    activeSessionStartTime,
    focusScore,
    neuralLayerEnabled,
    breakReminderEnabled,
    flowProtectionEnabled,
    environmentAdaptationEnabled,
    adaptationSensitivity,
    insights,
    
    setEmotionalState,
    setProductivityPattern,
    startSession,
    endSession,
    toggleNeuralLayer,
    toggleBreakReminder,
    toggleFlowProtection,
    toggleEnvironmentAdaptation,
    setAdaptationSensitivity,
    dismissInsight,
    generateRecommendations
  } = useNeuralLayer();
  
  const [sessionActive, setSessionActive] = useState(!!activeSessionStartTime);
  const [sessionTime, setSessionTime] = useState(0);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  
  // Calculate session time if active
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (activeSessionStartTime) {
      setSessionActive(true);
      timer = setInterval(() => {
        const startTime = new Date(activeSessionStartTime).getTime();
        const currentTime = new Date().getTime();
        const diff = Math.floor((currentTime - startTime) / 1000 / 60); // in minutes
        setSessionTime(diff);
      }, 60000); // update every minute
      
      // Initial calculation
      const startTime = new Date(activeSessionStartTime).getTime();
      const currentTime = new Date().getTime();
      const diff = Math.floor((currentTime - startTime) / 1000 / 60);
      setSessionTime(diff);
    } else {
      setSessionActive(false);
      setSessionTime(0);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [activeSessionStartTime]);
  
  // Load recommendations
  useEffect(() => {
    if (neuralLayerEnabled) {
      setRecommendations(generateRecommendations());
    }
  }, [neuralLayerEnabled, currentEmotionalState, generateRecommendations]);
  
  // Refresh recommendations periodically
  useEffect(() => {
    if (neuralLayerEnabled) {
      const timer = setInterval(() => {
        setRecommendations(generateRecommendations());
      }, 10 * 60 * 1000); // every 10 minutes
      
      return () => clearInterval(timer);
    }
  }, [neuralLayerEnabled, generateRecommendations]);
  
  // When emotional state changes, update recommendations
  useEffect(() => {
    if (neuralLayerEnabled) {
      setRecommendations(generateRecommendations());
    }
  }, [currentEmotionalState, neuralLayerEnabled, generateRecommendations]);
  
  const handleToggleSession = () => {
    if (sessionActive) {
      endSession();
    } else {
      startSession();
    }
  };
  
  const formatSessionTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };
  
  return (
    <div className="flex flex-col w-full gap-4 p-4">
      <div className="flex flex-row items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Brain className="w-6 h-6 text-purple-500" />
          <h2 className="text-xl font-bold">Creator Neural Layer</h2>
          <Badge variant={neuralLayerEnabled ? "default" : "outline"}>
            {neuralLayerEnabled ? "Active" : "Inactive"}
          </Badge>
        </div>
        
        <Switch 
          checked={neuralLayerEnabled}
          onCheckedChange={toggleNeuralLayer}
          aria-label="Toggle Neural Layer"
        />
      </div>
      
      {neuralLayerEnabled ? (
        <Tabs defaultValue="status" className="w-full">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="status">Current Status</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="session">Session</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="status" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Emotional State</CardTitle>
                <CardDescription>Your detected creative state</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  {Object.values(emotionTypes).map((emotion) => (
                    <EnhancedTooltip
                      key={emotion.state}
                      content={emotion.description}
                    >
                      <Button
                        variant={currentEmotionalState === emotion.state ? "default" : "outline"}
                        size="sm"
                        className={`flex items-center gap-1 ${currentEmotionalState === emotion.state ? emotion.color : ""}`}
                        onClick={() => setEmotionalState(emotion.state)}
                      >
                        {emotion.icon}
                        {emotion.label}
                      </Button>
                    </EnhancedTooltip>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Productivity Pattern</CardTitle>
                <CardDescription>Your dominant work style</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {Object.values(productivityPatterns).map((pattern) => (
                    <EnhancedTooltip
                      key={pattern.pattern}
                      content={pattern.description}
                    >
                      <Button
                        variant={dominantProductivityPattern === pattern.pattern ? "default" : "outline"}
                        size="sm"
                        onClick={() => setProductivityPattern(pattern.pattern)}
                      >
                        {pattern.icon}
                        {pattern.label}
                      </Button>
                    </EnhancedTooltip>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Focus Metrics</CardTitle>
                <CardDescription>Current focus assessment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Focus Score</span>
                      <span className={`text-sm font-medium ${
                        focusScore > 70 ? "text-green-500" : 
                        focusScore > 40 ? "text-amber-500" : 
                        "text-red-500"
                      }`}>{focusScore}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                      <div 
                        className={`h-2 rounded-full ${
                          focusScore > 70 ? "bg-green-500" : 
                          focusScore > 40 ? "bg-amber-500" : 
                          "bg-red-500"
                        }`} 
                        style={{ width: `${focusScore}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Recommendations</CardTitle>
                <CardDescription>Based on your current neural state</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Zap size={16} className="mt-1 text-amber-500 shrink-0" />
                      <span className="text-sm">{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="insights" className="space-y-4">
            {insights.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <Brain className="w-12 h-12 text-gray-400 mb-4" />
                  <p className="text-gray-500 text-center">
                    No insights yet. The neural layer will generate insights as you work.
                  </p>
                </CardContent>
              </Card>
            ) : (
              insights.map((insight) => (
                <Card key={insight.id} className="relative">
                  <button 
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                    onClick={() => dismissInsight(insight.id)}
                  >
                    <X size={16} />
                  </button>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{insight.title}</CardTitle>
                      <Badge variant="outline" className="ml-2">
                        {new Date(insight.timestamp).toLocaleDateString()}
                      </Badge>
                    </div>
                    <CardDescription>
                      Confidence: {insight.confidenceScore}% · State: {emotionTypes[insight.emotionalState].label}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-4">{insight.description}</p>
                    {insight.actionSuggestions && insight.actionSuggestions.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Suggested Actions</h4>
                        <ul className="space-y-1">
                          {insight.actionSuggestions.map((action, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <Zap size={14} className="mt-1 text-purple-500 shrink-0" />
                              <span className="text-xs">{action}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
          
          <TabsContent value="session" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Work Session</CardTitle>
                <CardDescription>Track your focus and productivity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center mb-6">
                  <div className="text-center mb-4">
                    {sessionActive ? (
                      <>
                        <p className="text-sm text-gray-500">Session in progress</p>
                        <p className="text-3xl font-bold">{formatSessionTime(sessionTime)}</p>
                      </>
                    ) : (
                      <p className="text-sm text-gray-500">No active session</p>
                    )}
                  </div>
                  
                  <Button
                    variant={sessionActive ? "destructive" : "default"}
                    onClick={handleToggleSession}
                    className="w-40"
                  >
                    {sessionActive ? "End Session" : "Start Session"}
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Record interruption would be called in a real implementation
                        console.log("Interruption recorded");
                      }}
                    >
                      <AlertTriangle size={16} className="mr-2" />
                      Record Interruption
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Take break would be called in a real implementation
                        console.log("Taking a break");
                      }}
                    >
                      <Coffee size={16} className="mr-2" />
                      Take a Break
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Session History</CardTitle>
                <CardDescription>Your recent work patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-40 flex items-center justify-center">
                  <p className="text-gray-500 text-sm">
                    Session history visualization would appear here
                  </p>
                  <LineChart className="w-6 h-6 ml-2 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Neural Layer Settings</CardTitle>
                <CardDescription>Configure how the neural layer works</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Break Reminders</h4>
                    <p className="text-sm text-gray-500">Remind you to take breaks during long sessions</p>
                  </div>
                  <Switch 
                    checked={breakReminderEnabled}
                    onCheckedChange={toggleBreakReminder}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Flow Protection</h4>
                    <p className="text-sm text-gray-500">Reduce interruptions during focused work</p>
                  </div>
                  <Switch 
                    checked={flowProtectionEnabled}
                    onCheckedChange={toggleFlowProtection}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Environment Adaptation</h4>
                    <p className="text-sm text-gray-500">Automatically adjust UI based on your state</p>
                  </div>
                  <Switch 
                    checked={environmentAdaptationEnabled}
                    onCheckedChange={toggleEnvironmentAdaptation}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Adaptation Sensitivity</h4>
                    <span className="text-sm">{adaptationSensitivity}%</span>
                  </div>
                  <Slider
                    defaultValue={[adaptationSensitivity]}
                    min={0}
                    max={100}
                    step={5}
                    onValueChange={(value) => setAdaptationSensitivity(value[0])}
                    disabled={!environmentAdaptationEnabled}
                  />
                  <p className="text-xs text-gray-500">
                    Higher sensitivity means more responsive environmental changes
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Data Management</CardTitle>
                <CardDescription>Control your neural layer data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" size="sm">Export Neural Data</Button>
                <Button variant="outline" size="sm" className="text-red-500">
                  Reset Neural Layer
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Brain className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-gray-500 text-center mb-4">
              The Creator Neural Layer is currently disabled. Enable it to receive personalized insights and recommendations based on your work patterns.
            </p>
            <Button onClick={toggleNeuralLayer}>
              Enable Neural Layer
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default CreatorNeuralLayer;