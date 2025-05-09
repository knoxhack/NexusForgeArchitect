import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useAudio } from "./useAudio";
import { useNotifications } from "./useNotifications";

// Types for the Neural Layer
export type EmotionalState = "focused" | "creative" | "overwhelmed" | "productive" | "learning" | "relaxed";
export type ProductivityPattern = "morning" | "evening" | "steady" | "bursts" | "deep-work" | "collaborative";
export type CreatorInsight = {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  emotionalState: EmotionalState;
  confidenceScore: number;
  actionSuggestions?: string[];
};

export type NeuralLayerState = {
  // Current state data
  currentEmotionalState: EmotionalState;
  dominantProductivityPattern: ProductivityPattern;
  activeSessionStartTime: string | null;
  activeSessionDuration: number; // in minutes
  focusScore: number; // 0-100
  flowInterruptions: number;
  lastBreakTime: string | null;
  
  // Historical data
  historicalEmotionalStates: Array<{state: EmotionalState, timestamp: string}>;
  historicalProductivityScores: Array<{score: number, timestamp: string}>;
  insights: CreatorInsight[];
  
  // Settings
  neuralLayerEnabled: boolean;
  breakReminderEnabled: boolean;
  flowProtectionEnabled: boolean;
  environmentAdaptationEnabled: boolean;
  adaptationSensitivity: number; // 0-100
  
  // Actions
  setEmotionalState: (state: EmotionalState) => void;
  setProductivityPattern: (pattern: ProductivityPattern) => void;
  startSession: () => void;
  endSession: () => void;
  recordInterruption: () => void;
  takeBreak: () => void;
  toggleNeuralLayer: () => void;
  toggleBreakReminder: () => void;
  toggleFlowProtection: () => void;
  toggleEnvironmentAdaptation: () => void;
  setAdaptationSensitivity: (level: number) => void;
  addInsight: (insight: Omit<CreatorInsight, "id" | "timestamp">) => void;
  dismissInsight: (id: string) => void;
  // Analysis methods
  analyzeWorkflow: () => void;
  generateRecommendations: () => string[];
  detectEmotionalState: () => EmotionalState;
};

// Helper to generate unique IDs
const generateId = () => Math.random().toString(36).substring(2, 9);

// Helper to get current time
const getCurrentTime = () => new Date().toISOString();

// Create the Neural Layer store
export const useNeuralLayer = create<NeuralLayerState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentEmotionalState: "focused",
      dominantProductivityPattern: "steady",
      activeSessionStartTime: null,
      activeSessionDuration: 0,
      focusScore: 70,
      flowInterruptions: 0,
      lastBreakTime: null,
      
      historicalEmotionalStates: [],
      historicalProductivityScores: [],
      insights: [],
      
      neuralLayerEnabled: true,
      breakReminderEnabled: true,
      flowProtectionEnabled: true,
      environmentAdaptationEnabled: true,
      adaptationSensitivity: 65,
      
      // Actions
      setEmotionalState: (state) => {
        set((prev) => ({
          currentEmotionalState: state,
          historicalEmotionalStates: [
            ...prev.historicalEmotionalStates,
            { state, timestamp: getCurrentTime() }
          ]
        }));
        
        // If state becomes overwhelmed, suggest a break
        if (state === "overwhelmed" && get().breakReminderEnabled) {
          const { addNotification } = useNotifications.getState();
          addNotification({
            title: "Neural Layer",
            message: "You seem to be overwhelmed. Consider taking a short break.",
            type: "info",
            priority: "medium",
            source: "Neural Layer"
          });
        }
        
        // Adjust audio settings based on emotional state (placeholder for future implementation)
        // In a real implementation, we would adjust audio characteristics by state
        console.log(`Neural Layer: Adjusted audio for ${state} state`);
      },
      
      setProductivityPattern: (pattern) => {
        set({ dominantProductivityPattern: pattern });
      },
      
      startSession: () => {
        set({ 
          activeSessionStartTime: getCurrentTime(),
          flowInterruptions: 0
        });
        console.log("Neural Layer: Session started");
      },
      
      endSession: () => {
        const { activeSessionStartTime } = get();
        if (activeSessionStartTime) {
          const start = new Date(activeSessionStartTime).getTime();
          const end = new Date().getTime();
          const durationMinutes = Math.round((end - start) / (1000 * 60));
          
          // Calculate productivity score
          const interruptions = get().flowInterruptions;
          const interruptionPenalty = Math.min(50, interruptions * 10);
          const rawScore = Math.max(0, 100 - interruptionPenalty);
          
          set((prev) => ({ 
            activeSessionStartTime: null,
            activeSessionDuration: durationMinutes,
            historicalProductivityScores: [
              ...prev.historicalProductivityScores,
              { score: rawScore, timestamp: getCurrentTime() }
            ]
          }));
          
          // Generate insight after session
          get().analyzeWorkflow();
          
          console.log(`Neural Layer: Session ended after ${durationMinutes} minutes with score ${rawScore}`);
        }
      },
      
      recordInterruption: () => {
        set((prev) => ({
          flowInterruptions: prev.flowInterruptions + 1
        }));
        
        // Check if flow protection is enabled
        if (get().flowProtectionEnabled && get().flowInterruptions > 3) {
          const { addNotification } = useNotifications.getState();
          addNotification({
            title: "Flow Protection",
            message: "You're experiencing frequent interruptions. Consider enabling focus mode.",
            type: "warning",
            priority: "high",
            source: "Neural Layer"
          });
        }
      },
      
      takeBreak: () => {
        set({ lastBreakTime: getCurrentTime() });
        
        // Play a notification sound
        const { playNotification } = useAudio.getState();
        playNotification();
        
        console.log("Neural Layer: Break started");
      },
      
      toggleNeuralLayer: () => {
        set((prev) => ({ neuralLayerEnabled: !prev.neuralLayerEnabled }));
      },
      
      toggleBreakReminder: () => {
        set((prev) => ({ breakReminderEnabled: !prev.breakReminderEnabled }));
      },
      
      toggleFlowProtection: () => {
        set((prev) => ({ flowProtectionEnabled: !prev.flowProtectionEnabled }));
      },
      
      toggleEnvironmentAdaptation: () => {
        set((prev) => ({ environmentAdaptationEnabled: !prev.environmentAdaptationEnabled }));
      },
      
      setAdaptationSensitivity: (level) => {
        set({ adaptationSensitivity: Math.max(0, Math.min(100, level)) });
      },
      
      addInsight: (insight) => {
        const newInsight: CreatorInsight = {
          ...insight,
          id: generateId(),
          timestamp: getCurrentTime()
        };
        
        set((prev) => ({
          insights: [newInsight, ...prev.insights]
        }));
        
        // Notify user of new insight
        const { addNotification } = useNotifications.getState();
        addNotification({
          title: "New Creator Insight",
          message: insight.title,
          type: "success",
          priority: "medium",
          source: "Neural Layer"
        });
      },
      
      dismissInsight: (id) => {
        set((prev) => ({
          insights: prev.insights.filter(insight => insight.id !== id)
        }));
      },
      
      analyzeWorkflow: () => {
        const { 
          historicalEmotionalStates,
          historicalProductivityScores,
          flowInterruptions,
          activeSessionDuration
        } = get();
        
        // Only analyze if we have enough data
        if (historicalEmotionalStates.length < 5 || historicalProductivityScores.length < 3) {
          return;
        }
        
        // Detect dominant emotional state
        const emotionCounts: Record<EmotionalState, number> = {
          "focused": 0,
          "creative": 0,
          "overwhelmed": 0,
          "productive": 0,
          "learning": 0,
          "relaxed": 0
        };
        
        historicalEmotionalStates.slice(-10).forEach(item => {
          emotionCounts[item.state]++;
        });
        
        const dominantEmotion = Object.entries(emotionCounts)
          .sort((a, b) => b[1] - a[1])[0][0] as EmotionalState;
        
        // Calculate average productivity
        const recentScores = historicalProductivityScores.slice(-5);
        const avgProductivity = recentScores.reduce((sum, item) => sum + item.score, 0) / recentScores.length;
        
        // Interruption rate per hour
        const interruptionsPerHour = activeSessionDuration > 0 
          ? (flowInterruptions / (activeSessionDuration / 60))
          : 0;
        
        // Generate insight based on analysis
        const generateInsightTitle = (): string => {
          if (avgProductivity > 80) return "Peak Performance Pattern Detected";
          if (interruptionsPerHour > 5) return "High Interruption Rate Affecting Flow";
          if (dominantEmotion === "overwhelmed") return "Stress Management Opportunity";
          if (dominantEmotion === "creative" && avgProductivity > 70) return "Creative Flow State Identified";
          return "Workflow Pattern Analysis";
        };
        
        const generateInsightDesc = (): string => {
          if (avgProductivity > 80) {
            return "You're performing at peak levels. Your current environment and workflow patterns are supporting optimal productivity.";
          }
          if (interruptionsPerHour > 5) {
            return `You're experiencing approximately ${Math.round(interruptionsPerHour)} interruptions per hour, which may be impacting your ability to achieve flow state.`;
          }
          if (dominantEmotion === "overwhelmed") {
            return "Your emotional patterns indicate elevated stress levels. Consider implementing stress management techniques into your workflow.";
          }
          if (dominantEmotion === "creative" && avgProductivity > 70) {
            return "You're maintaining both creativity and productivity, indicating an ideal flow state for creative work.";
          }
          return "Your workflow patterns show a balanced approach with opportunities for optimization.";
        };
        
        const generateSuggestions = (): string[] => {
          const suggestions: string[] = [];
          
          if (avgProductivity < 60) {
            suggestions.push("Try working in focused 25-minute blocks followed by short breaks.");
            suggestions.push("Adjust your environment to minimize distractions.");
          }
          
          if (interruptionsPerHour > 5) {
            suggestions.push("Consider using the 'Flow Protection' mode to reduce interruptions.");
            suggestions.push("Schedule specific times for checking messages and notifications.");
          }
          
          if (dominantEmotion === "overwhelmed") {
            suggestions.push("Implement a 5-minute breathing or meditation exercise between tasks.");
            suggestions.push("Break large projects into smaller, more manageable tasks.");
          }
          
          return suggestions.length > 0 ? suggestions : ["Maintain your current workflow patterns", "Consider documenting what's working well in your process"];
        };
        
        // Create the insight
        if (get().neuralLayerEnabled) {
          get().addInsight({
            title: generateInsightTitle(),
            description: generateInsightDesc(),
            emotionalState: dominantEmotion,
            confidenceScore: Math.min(95, 50 + historicalEmotionalStates.length + historicalProductivityScores.length),
            actionSuggestions: generateSuggestions()
          });
        }
      },
      
      generateRecommendations: () => {
        const { 
          currentEmotionalState, 
          dominantProductivityPattern,
          focusScore,
          historicalProductivityScores
        } = get();
        
        const recommendations: string[] = [];
        
        // Time-based recommendations
        const hour = new Date().getHours();
        if (hour < 12 && dominantProductivityPattern === "morning") {
          recommendations.push("Your peak productivity is now. Focus on your most complex tasks.");
        } else if (hour >= 16 && dominantProductivityPattern === "evening") {
          recommendations.push("You typically perform well in the evening. Consider tackling important work now.");
        }
        
        // State-based recommendations
        if (currentEmotionalState === "creative") {
          recommendations.push("You're in a creative state. This is an ideal time for brainstorming and innovative work.");
        } else if (currentEmotionalState === "focused") {
          recommendations.push("Your focus is high. Consider deep work on technical or detail-oriented tasks.");
        } else if (currentEmotionalState === "overwhelmed") {
          recommendations.push("Take a short break to reset. Try a 5-minute walking or breathing exercise.");
          recommendations.push("Break down your current task into smaller, more manageable steps.");
        }
        
        // Focus-based recommendations
        if (focusScore < 50) {
          recommendations.push("Your focus appears low. Consider changing your environment or taking a short break.");
        }
        
        // Trend-based recommendations
        if (historicalProductivityScores.length >= 3) {
          const recent = historicalProductivityScores.slice(-3);
          const trend = recent[2].score - recent[0].score;
          
          if (trend > 15) {
            recommendations.push("Your productivity is trending upward. Maintain your current approach.");
          } else if (trend < -15) {
            recommendations.push("Your productivity is declining. Consider what's changed in your workflow recently.");
          }
        }
        
        return recommendations.length > 0 
          ? recommendations 
          : ["Maintain a balanced workflow", "Remember to take regular breaks"];
      },
      
      detectEmotionalState: () => {
        // In a real implementation, this would use various signals like:
        // - Input speed and patterns
        // - Frequency of deletions/corrections
        // - Mouse movement patterns
        // - Time between actions
        // - Application switching frequency
        
        // For demonstration, return a random state with weighted probability
        const states: EmotionalState[] = ["focused", "creative", "overwhelmed", "productive", "learning", "relaxed"];
        const weights = [0.3, 0.2, 0.1, 0.2, 0.1, 0.1]; // Higher probability for focused
        
        const random = Math.random();
        let cumulativeWeight = 0;
        
        for (let i = 0; i < states.length; i++) {
          cumulativeWeight += weights[i];
          if (random <= cumulativeWeight) {
            return states[i];
          }
        }
        
        return "focused"; // Default fallback
      }
    }),
    {
      name: "neural-layer-storage",
      partialize: (state) => ({
        neuralLayerEnabled: state.neuralLayerEnabled,
        breakReminderEnabled: state.breakReminderEnabled,
        flowProtectionEnabled: state.flowProtectionEnabled,
        environmentAdaptationEnabled: state.environmentAdaptationEnabled,
        adaptationSensitivity: state.adaptationSensitivity,
        insights: state.insights,
        historicalEmotionalStates: state.historicalEmotionalStates,
        historicalProductivityScores: state.historicalProductivityScores,
        dominantProductivityPattern: state.dominantProductivityPattern
      })
    }
  )
);

export default useNeuralLayer;