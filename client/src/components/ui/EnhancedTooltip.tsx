import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface EnhancedTooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  className?: string;
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
  align?: "start" | "center" | "end";
  variant?: "default" | "info" | "success" | "warning" | "error";
  delayDuration?: number;
}

export function EnhancedTooltip({
  children,
  content,
  className = "",
  side = "top",
  sideOffset = 4,
  align = "center",
  variant = "default",
  delayDuration = 300,
}: EnhancedTooltipProps) {
  // Define color variants
  const variantClasses = {
    default: "bg-primary text-primary-foreground",
    info: "bg-blue-600 text-white",
    success: "bg-green-600 text-white",
    warning: "bg-amber-600 text-white",
    error: "bg-red-600 text-white",
  };

  return (
    <TooltipProvider>
      <Tooltip delayDuration={delayDuration}>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent
          side={side}
          sideOffset={sideOffset}
          align={align}
          className={`${variantClasses[variant]} ${className} font-medium text-xs px-3 py-1.5 rounded-md shadow-md max-w-xs`}
        >
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}