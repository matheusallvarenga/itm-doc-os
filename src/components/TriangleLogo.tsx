import { cn } from "@/lib/utils";

interface TriangleLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  animate?: boolean;
}

const sizeClasses = {
  sm: "w-8 h-8",
  md: "w-12 h-12",
  lg: "w-16 h-16",
  xl: "w-24 h-24",
};

export function TriangleLogo({ className, size = "md", animate = false }: TriangleLogoProps) {
  return (
    <div className={cn("relative", sizeClasses[size], className)}>
      <svg
        viewBox="0 0 100 100"
        className={cn(
          "w-full h-full",
          animate && "animate-pulse-glow"
        )}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Glow filter */}
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="triangleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(193, 100%, 50%)" />
            <stop offset="100%" stopColor="hsl(193, 100%, 35%)" />
          </linearGradient>
        </defs>

        {/* Radiating lines */}
        <g className="opacity-40">
          <line x1="50" y1="50" x2="50" y2="5" stroke="hsl(193, 100%, 40%)" strokeWidth="0.5" />
          <line x1="50" y1="50" x2="85" y2="25" stroke="hsl(193, 100%, 40%)" strokeWidth="0.5" />
          <line x1="50" y1="50" x2="95" y2="50" stroke="hsl(193, 100%, 40%)" strokeWidth="0.5" />
          <line x1="50" y1="50" x2="85" y2="75" stroke="hsl(193, 100%, 40%)" strokeWidth="0.5" />
          <line x1="50" y1="50" x2="50" y2="95" stroke="hsl(193, 100%, 40%)" strokeWidth="0.5" />
          <line x1="50" y1="50" x2="15" y2="75" stroke="hsl(193, 100%, 40%)" strokeWidth="0.5" />
          <line x1="50" y1="50" x2="5" y2="50" stroke="hsl(193, 100%, 40%)" strokeWidth="0.5" />
          <line x1="50" y1="50" x2="15" y2="25" stroke="hsl(193, 100%, 40%)" strokeWidth="0.5" />
        </g>

        {/* Main triangle */}
        <polygon
          points="50,15 85,80 15,80"
          fill="none"
          stroke="url(#triangleGradient)"
          strokeWidth="2"
          filter="url(#glow)"
        />

        {/* Inner triangle */}
        <polygon
          points="50,30 70,70 30,70"
          fill="none"
          stroke="hsl(193, 100%, 40%)"
          strokeWidth="1"
          className="opacity-50"
        />

        {/* Center point */}
        <circle
          cx="50"
          cy="55"
          r="3"
          fill="hsl(193, 100%, 50%)"
          filter="url(#glow)"
        />
      </svg>
    </div>
  );
}
