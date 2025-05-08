import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Accessibility, 
  Eye, 
  EyeOff, 
  VolumeX, 
  Volume2, 
  MonitorSmartphone, 
  MousePointer, 
  Keyboard, 
  Gauge, 
  Sparkles,
  Palette,
  Type,
  ZoomIn 
} from "lucide-react";
import { useAudio } from "@/lib/stores/useAudio";

interface AccessibilitySettingsProps {
  trigger?: React.ReactNode;
}

export function AccessibilitySettings({ trigger }: AccessibilitySettingsProps) {
  const { volume, setVolume, isMuted, toggleMute } = useAudio();
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState({
    highContrast: false,
    reducedMotion: false,
    largeText: false,
    simplifiedUI: false,
    keyboardFocus: true,
    cursorSize: 1,
    animationSpeed: 1,
    fontScale: 1,
  });

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("nexusforge_accessibility");
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem("nexusforge_accessibility", JSON.stringify(settings));
    
    // Apply settings to document
    document.documentElement.style.setProperty('--animation-speed', `${settings.animationSpeed}`);
    document.documentElement.style.setProperty('--font-scale', `${settings.fontScale}`);
    
    // Apply high contrast
    if (settings.highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
    
    // Apply reduced motion
    if (settings.reducedMotion) {
      document.documentElement.classList.add('reduced-motion');
    } else {
      document.documentElement.classList.remove('reduced-motion');
    }
    
    // Apply large text
    if (settings.largeText) {
      document.documentElement.classList.add('large-text');
    } else {
      document.documentElement.classList.remove('large-text');
    }
    
    // Apply simplified UI
    if (settings.simplifiedUI) {
      document.documentElement.classList.add('simplified-ui');
    } else {
      document.documentElement.classList.remove('simplified-ui');
    }
  }, [settings]);

  const handleReset = () => {
    setSettings({
      highContrast: false,
      reducedMotion: false,
      largeText: false,
      simplifiedUI: false,
      keyboardFocus: true,
      cursorSize: 1,
      animationSpeed: 1,
      fontScale: 1,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full p-2 bg-black/40 text-white hover:bg-black/60 absolute bottom-4 left-4 z-50"
            aria-label="Accessibility Settings"
          >
            <Accessibility className="h-5 w-5" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Accessibility className="h-5 w-5 text-cyan-500" />
            Accessibility Settings
          </DialogTitle>
          <DialogDescription>
            Customize your NEXUSFORGE OS experience to suit your needs.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="visual" className="mt-4">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="visual" className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>Visual</span>
            </TabsTrigger>
            <TabsTrigger value="audio" className="flex items-center gap-1">
              <Volume2 className="h-4 w-4" />
              <span>Audio</span> 
            </TabsTrigger>
            <TabsTrigger value="interface" className="flex items-center gap-1">
              <MousePointer className="h-3 w-3" />
              <span>Interface</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="visual" className="mt-4 space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Palette className="h-4 w-4 text-blue-500" />
                  <Label htmlFor="highContrast">High Contrast Mode</Label>
                  <Badge variant="outline" className="ml-2 text-xs">Vision</Badge>
                </div>
                <Switch
                  id="highContrast"
                  checked={settings.highContrast}
                  onCheckedChange={(checked) => setSettings({...settings, highContrast: checked})}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-yellow-500" />
                  <Label htmlFor="reducedMotion">Reduced Motion</Label>
                  <Badge variant="outline" className="ml-2 text-xs">Motion Sensitivity</Badge>
                </div>
                <Switch
                  id="reducedMotion"
                  checked={settings.reducedMotion}
                  onCheckedChange={(checked) => setSettings({...settings, reducedMotion: checked})}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Type className="h-4 w-4 text-green-500" />
                  <Label htmlFor="fontScale">Font Size</Label>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm">A</span>
                  <Slider
                    id="fontScale"
                    min={0.8}
                    max={1.5}
                    step={0.1}
                    value={[settings.fontScale]}
                    onValueChange={([value]) => setSettings({...settings, fontScale: value})}
                    className="flex-1"
                  />
                  <span className="text-lg">A</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <ZoomIn className="h-4 w-4 text-purple-500" />
                  <Label htmlFor="animationSpeed">Animation Speed</Label>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm">Slow</span>
                  <Slider
                    id="animationSpeed"
                    min={0.5}
                    max={1.5}
                    step={0.1}
                    value={[settings.animationSpeed]}
                    onValueChange={([value]) => setSettings({...settings, animationSpeed: value})}
                    className="flex-1"
                  />
                  <span className="text-sm">Fast</span>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="audio" className="mt-4 space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isMuted ? (
                    <VolumeX className="h-4 w-4 text-red-500" />
                  ) : (
                    <Volume2 className="h-4 w-4 text-green-500" />
                  )}
                  <Label htmlFor="mute">Mute All Sounds</Label>
                </div>
                <Switch
                  id="mute"
                  checked={isMuted}
                  onCheckedChange={toggleMute}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="volume">Master Volume</Label>
                <div className="flex items-center gap-4">
                  <VolumeX className="h-4 w-4" />
                  <Slider
                    id="volume"
                    min={0}
                    max={1}
                    step={0.01}
                    value={[volume]}
                    onValueChange={([value]) => setVolume(value)}
                    className="flex-1"
                    disabled={isMuted}
                  />
                  <Volume2 className="h-4 w-4" />
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="interface" className="mt-4 space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MonitorSmartphone className="h-4 w-4 text-cyan-500" />
                  <Label htmlFor="simplifiedUI">Simplified Interface</Label>
                  <Badge variant="outline" className="ml-2 text-xs">Cognitive</Badge>
                </div>
                <Switch
                  id="simplifiedUI"
                  checked={settings.simplifiedUI}
                  onCheckedChange={(checked) => setSettings({...settings, simplifiedUI: checked})}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Keyboard className="h-4 w-4 text-indigo-500" />
                  <Label htmlFor="keyboardFocus">Enhanced Keyboard Focus</Label>
                  <Badge variant="outline" className="ml-2 text-xs">Motor</Badge>
                </div>
                <Switch
                  id="keyboardFocus"
                  checked={settings.keyboardFocus}
                  onCheckedChange={(checked) => setSettings({...settings, keyboardFocus: checked})}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MousePointer className="h-4 w-4 text-orange-500" />
                  <Label htmlFor="cursorSize">Cursor Size</Label>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm">Small</span>
                  <Slider
                    id="cursorSize"
                    min={1}
                    max={2}
                    step={0.1}
                    value={[settings.cursorSize]}
                    onValueChange={([value]) => setSettings({...settings, cursorSize: value})}
                    className="flex-1"
                  />
                  <span className="text-sm">Large</span>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="flex justify-between items-center mt-6">
          <Button 
            variant="outline" 
            onClick={handleReset}
            size="sm"
          >
            Reset to Default
          </Button>
          <Button onClick={() => setIsOpen(false)}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AccessibilitySettings;