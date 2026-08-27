import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { DetectionFeature } from "@/types/detection";

interface FeatureBarProps {
  feature: DetectionFeature;
  delay: number;
}

export default function FeatureBar({ feature, delay }: FeatureBarProps) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setWidth(feature.score), delay);
    return () => clearTimeout(timer);
  }, [feature.score, delay]);

  const getColor = (score: number) => {
    if (score >= 75) return "bg-red-500";
    if (score >= 55) return "bg-orange-500";
    if (score >= 35) return "bg-yellow-500";
    return "bg-emerald-500";
  };

  const getTextColor = (score: number) => {
    if (score >= 75) return "text-red-400";
    if (score >= 55) return "text-orange-400";
    if (score >= 35) return "text-yellow-400";
    return "text-emerald-400";
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">{feature.name}</span>
        <span className={cn("text-sm font-mono font-bold tabular-nums", getTextColor(feature.score))}>
          {feature.score}%
        </span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-700 ease-out", getColor(feature.score))}
          style={{ width: `${width}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">{feature.description}</p>
    </div>
  );
}
