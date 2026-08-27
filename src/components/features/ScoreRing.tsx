import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { Verdict } from "@/types/detection";
import { VERDICT_CONFIG } from "@/constants";

interface ScoreRingProps {
  aiProbability: number;
  verdict: Verdict;
}

export default function ScoreRing({ aiProbability, verdict }: ScoreRingProps) {
  const [displayScore, setDisplayScore] = useState(0);
  const config = VERDICT_CONFIG[verdict];

  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (displayScore / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => {
      let start = 0;
      const step = aiProbability / 60;
      const interval = setInterval(() => {
        start += step;
        if (start >= aiProbability) {
          setDisplayScore(aiProbability);
          clearInterval(interval);
        } else {
          setDisplayScore(Math.round(start));
        }
      }, 16);
      return () => clearInterval(interval);
    }, 200);
    return () => clearTimeout(timer);
  }, [aiProbability]);

  const strokeColor = verdict === "ai" ? "#f87171" : verdict === "mixed" ? "#fb923c" : verdict === "uncertain" ? "#facc15" : "#34d399";

  return (
    <div className="relative flex items-center justify-center">
      {/* Pulse ring */}
      <div
        className={cn("absolute rounded-full border-2 animate-pulse-ring", config.borderColor)}
        style={{ width: 160, height: 160 }}
      />

      <svg width="160" height="160" className="rotate-[-90deg]">
        {/* Background track */}
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke="hsl(222 35% 14%)"
          strokeWidth="10"
        />
        {/* Score arc */}
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          className="transition-all duration-1000 ease-out"
          style={{ filter: `drop-shadow(0 0 8px ${strokeColor}80)` }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("text-4xl font-bold font-mono tabular-nums", config.color)}>
          {displayScore}%
        </span>
        <span className="text-xs text-muted-foreground font-mono mt-0.5">AI Probability</span>
      </div>
    </div>
  );
}
