import React, { useState, useEffect } from "react";
import { Cog, Check, Save, RotateCcw, Palette, Volume2, Bell, Monitor, Keyboard, Sparkles, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useNotifications } from "@/lib/stores/useNotifications";
import { useAudio } from "@/lib/stores/useAudio";
import { useGame } from "@/lib/stores/useGame";
import { useTheme } from "@/components/ui/theme-provider";

interface UserPreferencesProps {
  trigger?: React.ReactNode;
}

interface Preferences {
  theme: string;
  autoSave: boolean;
  notificationsEnabled: boolean;
  sfxVolume: number;
  musicVolume: number;
  primaryColor: string;
  textSize: string;
  autoConnect: boolean;
  autoCategorize: boolean;
  enableSuggestions: boolean;
  saveInterval: number;
  defaultView: string;
  keyboardShortcuts: {
    godMode: string;
    assistant: string;
    menu: string;
    search: string;
  };
}

const defaultPreferences: Preferences = {
  theme: "system",
  autoSave: true,
  notificationsEnabled: true,
  sfxVolume: 0.7,
  musicVolume: 0.5,
  primaryColor: "blue",
  textSize: "medium",
  autoConnect: true,
  autoCategorize: true,
  enableSuggestions: true,
  saveInterval: 5,
  defaultView: "universe",
  keyboardShortcuts: {
    godMode: "G",
    assistant: "I",
    menu: "M",
    search: "F",
  },
};

export function UserPreferences({ trigger }: UserPreferencesProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [preferences, setPreferences] = useState<Preferences>(defaultPreferences);
  const [originalPreferences, setOriginalPreferences] = useState<Preferences>(defaultPreferences);
  const [hasChanges, setHasChanges] = useState(false);
  
  const { theme, setTheme } = useTheme();
  const { toggleNotifications } = useGame();
  const { setVolume, isMuted, toggleMute } = useAudio();
  const { addNotification } = useNotifications();
  
  // Load preferences from localStorage
  useEffect(() => {
    const savedPreferences = localStorage.getItem("nexusforge_preferences");
    if (savedPreferences) {
      const parsed = JSON.parse(savedPreferences);
      setPreferences(parsed);
      setOriginalPreferences(parsed);
    }
  }, []);
  
  // Check for changes
  useEffect(() => {
    const changed = JSON.stringify(preferences) !== JSON.stringify(originalPreferences);
    setHasChanges(changed);
  }, [preferences, originalPreferences]);
  
  // Handle theme change
  useEffect(() => {
    if (preferences.theme !== 'system' && preferences.theme !== theme) {
      setTheme(preferences.theme as 'light' | 'dark' | 'system');
    }
  }, [preferences.theme, setTheme, theme]);
  
  // Handle save
  const handleSave = () => {
    localStorage.setItem("nexusforge_preferences", JSON.stringify(preferences));
    setOriginalPreferences({...preferences});
    
    // Apply preferences
    setVolume(preferences.sfxVolume);
    
    // Show notification
    addNotification({
      title: "Preferences Saved",
      message: "Your preferences have been updated successfully.",
      type: "success",
      priority: "low",
      source: "System Settings"
    });
    
    setIsOpen(false);
  };
  
  // Handle reset
  const handleReset = () => {
    setPreferences(defaultPreferences);
  };
  
  // Handle individual preference changes
  const handleChange = (key: keyof Preferences, value: any) => {
    setPreferences({
      ...preferences,
      [key]: value,
    });
  };
  
  // Handle nested preference changes (keyboard shortcuts)
  const handleShortcutChange = (key: keyof typeof preferences.keyboardShortcuts, value: string) => {
    setPreferences({
      ...preferences,
      keyboardShortcuts: {
        ...preferences.keyboardShortcuts,
        [key]: value.toUpperCase(),
      },
    });
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full p-2 bg-black/40 text-white hover:bg-black/60 absolute top-4 right-4 z-50"
            aria-label="User Preferences"
          >
            <Cog className="h-5 w-5" />
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Cog className="h-5 w-5 text-primary" />
            User Preferences
          </DialogTitle>
          <DialogDescription>
            Customize your NEXUSFORGE OS experience
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="appearance" className="mt-6">
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="appearance" className="flex items-center gap-1">
              <Palette className="h-4 w-4" />
              <span>Appearance</span>
            </TabsTrigger>
            <TabsTrigger value="sound" className="flex items-center gap-1">
              <Volume2 className="h-4 w-4" />
              <span>Sound</span>
            </TabsTrigger>
            <TabsTrigger value="behavior" className="flex items-center gap-1">
              <Sparkles className="h-4 w-4" />
              <span>Behavior</span>
            </TabsTrigger>
            <TabsTrigger value="controls" className="flex items-center gap-1">
              <Keyboard className="h-4 w-4" />
              <span>Controls</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="appearance" className="space-y-6 py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Theme</Label>
                <div className="flex items-center space-x-4">
                  <RadioGroup 
                    value={preferences.theme} 
                    onValueChange={(value) => handleChange("theme", value)}
                    className="flex space-x-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="light" id="theme-light" />
                      <Label htmlFor="theme-light" className="flex items-center gap-1 cursor-pointer">
                        <Sun className="h-4 w-4" /> Light
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="dark" id="theme-dark" />
                      <Label htmlFor="theme-dark" className="flex items-center gap-1 cursor-pointer">
                        <Moon className="h-4 w-4" /> Dark
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="system" id="theme-system" />
                      <Label htmlFor="theme-system" className="flex items-center gap-1 cursor-pointer">
                        <Monitor className="h-4 w-4" /> System
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="primary-color">Primary Color</Label>
                <Select 
                  value={preferences.primaryColor} 
                  onValueChange={(value) => handleChange("primaryColor", value)}
                >
                  <SelectTrigger id="primary-color">
                    <SelectValue placeholder="Select color" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="blue">Blue</SelectItem>
                    <SelectItem value="teal">Teal</SelectItem>
                    <SelectItem value="green">Green</SelectItem>
                    <SelectItem value="purple">Purple</SelectItem>
                    <SelectItem value="orange">Orange</SelectItem>
                    <SelectItem value="red">Red</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="text-size">Text Size</Label>
                <Select 
                  value={preferences.textSize} 
                  onValueChange={(value) => handleChange("textSize", value)}
                >
                  <SelectTrigger id="text-size">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="sound" className="space-y-6 py-4">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Label htmlFor="enable-sound">Enable Sound</Label>
                <Switch 
                  id="enable-sound" 
                  checked={!isMuted}
                  onCheckedChange={toggleMute}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="music-volume">Music Volume</Label>
                  <span className="text-sm">{Math.round(preferences.musicVolume * 100)}%</span>
                </div>
                <Slider 
                  id="music-volume"
                  min={0} 
                  max={1} 
                  step={0.01}
                  value={[preferences.musicVolume]}
                  onValueChange={([value]) => handleChange("musicVolume", value)}
                  disabled={isMuted}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="sfx-volume">Sound Effects Volume</Label>
                  <span className="text-sm">{Math.round(preferences.sfxVolume * 100)}%</span>
                </div>
                <Slider 
                  id="sfx-volume"
                  min={0} 
                  max={1} 
                  step={0.01}
                  value={[preferences.sfxVolume]}
                  onValueChange={([value]) => handleChange("sfxVolume", value)}
                  disabled={isMuted}
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="behavior" className="space-y-6 py-4">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Label htmlFor="enable-notifications">Enable Notifications</Label>
                <Switch 
                  id="enable-notifications" 
                  checked={preferences.notificationsEnabled}
                  onCheckedChange={(checked) => {
                    handleChange("notificationsEnabled", checked);
                    toggleNotifications();
                  }}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-save">Auto-Save Projects</Label>
                <Switch 
                  id="auto-save" 
                  checked={preferences.autoSave}
                  onCheckedChange={(checked) => handleChange("autoSave", checked)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="save-interval">Auto-Save Interval (minutes)</Label>
                <div className="flex items-center gap-2">
                  <Slider 
                    id="save-interval"
                    min={1} 
                    max={30} 
                    step={1}
                    value={[preferences.saveInterval]}
                    onValueChange={([value]) => handleChange("saveInterval", value)}
                    disabled={!preferences.autoSave}
                    className="flex-1"
                  />
                  <span className="min-w-[3ch] text-right">{preferences.saveInterval}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-connect">Auto-Connect Related Projects</Label>
                <Switch 
                  id="auto-connect" 
                  checked={preferences.autoConnect}
                  onCheckedChange={(checked) => handleChange("autoConnect", checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-categorize">Auto-Categorize Projects</Label>
                <Switch 
                  id="auto-categorize" 
                  checked={preferences.autoCategorize}
                  onCheckedChange={(checked) => handleChange("autoCategorize", checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="enable-suggestions">AI Suggestions</Label>
                <Switch 
                  id="enable-suggestions" 
                  checked={preferences.enableSuggestions}
                  onCheckedChange={(checked) => handleChange("enableSuggestions", checked)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="default-view">Default View</Label>
                <Select 
                  value={preferences.defaultView} 
                  onValueChange={(value) => handleChange("defaultView", value)}
                >
                  <SelectTrigger id="default-view">
                    <SelectValue placeholder="Select view" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="universe">Universe</SelectItem>
                    <SelectItem value="timeline">Timeline</SelectItem>
                    <SelectItem value="assistant">Assistant</SelectItem>
                    <SelectItem value="stats">Stats</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="controls" className="space-y-6 py-4">
            <div className="space-y-6">
              <h3 className="text-sm font-medium">Keyboard Shortcuts</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="shortcut-godmode">God Mode</Label>
                  <Input 
                    id="shortcut-godmode" 
                    value={preferences.keyboardShortcuts.godMode}
                    onChange={(e) => handleShortcutChange("godMode", e.target.value)}
                    maxLength={1}
                    className="uppercase"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="shortcut-assistant">Assistant</Label>
                  <Input 
                    id="shortcut-assistant" 
                    value={preferences.keyboardShortcuts.assistant}
                    onChange={(e) => handleShortcutChange("assistant", e.target.value)}
                    maxLength={1}
                    className="uppercase"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="shortcut-menu">Menu</Label>
                  <Input 
                    id="shortcut-menu" 
                    value={preferences.keyboardShortcuts.menu}
                    onChange={(e) => handleShortcutChange("menu", e.target.value)}
                    maxLength={1}
                    className="uppercase"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="shortcut-search">Search</Label>
                  <Input 
                    id="shortcut-search" 
                    value={preferences.keyboardShortcuts.search}
                    onChange={(e) => handleShortcutChange("search", e.target.value)}
                    maxLength={1}
                    className="uppercase"
                  />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="flex justify-between items-center mt-6">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleReset}
              className="flex items-center gap-1"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="default" 
              onClick={handleSave}
              disabled={!hasChanges}
              className="flex items-center gap-1"
            >
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default UserPreferences;