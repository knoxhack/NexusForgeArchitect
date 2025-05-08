import React from "react";
import { useAudio } from "@/lib/stores/useAudio";
import { VolumeX, Volume2, Volume1, Volume } from "lucide-react";
import { Slider } from "@/components/ui/slider";

interface AudioControlsProps {
  className?: string;
  showVolume?: boolean;
}

export function AudioControls({ className = "", showVolume = false }: AudioControlsProps) {
  const { toggleMute, isMuted, volume, setVolume, startBackgroundMusic, stopBackgroundMusic } = useAudio();

  // Handle volume change
  const handleVolumeChange = (newVolume: number[]) => {
    setVolume(newVolume[0]);
  };

  // Choose icon based on mute state and volume level
  const renderVolumeIcon = () => {
    if (isMuted) return <VolumeX className="h-5 w-5" />;
    
    if (volume > 0.7) return <Volume2 className="h-5 w-5" />;
    if (volume > 0.3) return <Volume1 className="h-5 w-5" />;
    return <Volume className="h-5 w-5" />;
  };

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