import React, { useState } from "react";
import { useAudio, SoundCategory } from "@/lib/stores/useAudio";
import { VolumeX, Volume2, Volume1, Volume, Music, Bell, Zap } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface AudioControlsProps {
  className?: string;
  showVolume?: boolean;
  showAdvanced?: boolean;
}

export function AudioControls({ 
  className = "", 
  showVolume = false, 
  showAdvanced = false 
}: AudioControlsProps) {
  const { 
    toggleMute, 
    isMuted, 
    volume, 
    setVolume, 
    startBackgroundMusic, 
    stopBackgroundMusic,
    categoryVolumes,
    setCategoryVolume
  } = useAudio();
  
  const [expandedControls, setExpandedControls] = useState(false);

  // Handle volume change
  const handleVolumeChange = (newVolume: number[]) => {
    setVolume(newVolume[0]);
  };
  
  // Handle category volume change
  const handleCategoryVolumeChange = (category: SoundCategory, newVolume: number[]) => {
    setCategoryVolume(category, newVolume[0]);
  };

  // Choose icon based on mute state and volume level
  const renderVolumeIcon = () => {
    if (isMuted) return <VolumeX className="h-5 w-5" />;
    
    if (volume > 0.7) return <Volume2 className="h-5 w-5" />;
    if (volume > 0.3) return <Volume1 className="h-5 w-5" />;
    return <Volume className="h-5 w-5" />;
  };
  
  // Category specific icons
  const getCategoryIcon = (category: SoundCategory) => {
    switch(category) {
      case 'background':
        return <Music className="h-4 w-4 mr-2" />;
      case 'notification':
        return <Bell className="h-4 w-4 mr-2" />;
      case 'effects':
        return <Zap className="h-4 w-4 mr-2" />;
      default:
        return <Volume className="h-4 w-4 mr-2" />;
    }
  };

  // Simple version
  if (!showAdvanced) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <button
          onClick={toggleMute}
          className="p-2 rounded-full bg-background hover:bg-muted/30 transition-colors"
          title={isMuted ? "Unmute" : "Mute"}
        >
          {renderVolumeIcon()}
        </button>
        
        {showVolume && (
          <div className="w-24">
            <Slider
              value={[volume]}
              max={1}
              step={0.05}
              onValueChange={handleVolumeChange}
              className="cursor-pointer"
            />
          </div>
        )}
      </div>
    );
  }
  
  // Advanced controls with category volume mixing
  return (
    <div className={`${className}`}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="p-2 h-auto">
            {renderVolumeIcon()}
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="w-[280px] p-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Master Volume</h3>
              <button
                onClick={toggleMute}
                className="text-xs text-primary"
              >
                {isMuted ? "Unmute" : "Mute"}
              </button>
            </div>
            
            <Slider
              value={[volume]}
              max={1}
              step={0.05}
              onValueChange={handleVolumeChange}
              className="cursor-pointer"
              disabled={isMuted}
            />
            
            <Tabs defaultValue="background" className="w-full">
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="background">Music</TabsTrigger>
                <TabsTrigger value="effects">Effects</TabsTrigger>
                <TabsTrigger value="notification">UI</TabsTrigger>
              </TabsList>
              
              {(['background', 'effects', 'notification'] as SoundCategory[]).map(category => (
                <TabsContent key={category} value={category} className="pt-3">
                  <div className="flex items-center">
                    {getCategoryIcon(category)}
                    <div className="flex-1">
                      <Slider
                        value={[categoryVolumes[category]]}
                        max={1}
                        step={0.05}
                        onValueChange={(val) => handleCategoryVolumeChange(category, val)}
                        className="cursor-pointer"
                        disabled={isMuted}
                      />
                    </div>
                    <span className="ml-2 text-xs opacity-70 w-8 text-right">
                      {Math.round(categoryVolumes[category] * 100)}%
                    </span>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}