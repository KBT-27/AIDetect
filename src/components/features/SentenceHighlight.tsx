import type { SentenceAnalysis } from "@/types/detection";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface SentenceHighlightProps {
  sentences: SentenceAnalysis[];
}

const RISK_LEVELS = [
  { min: 75, label: "High AI risk", bg: "bg-red-500/20", border: "border-red-500/40", dot: "bg-red-400" },
  { min: 55, label: "Medium AI risk", bg: "bg-orange-500/15", border: "border-orange-500/30", dot: "bg-orange-400" },
  { min: 35, label: "Borderline", bg: "bg-yellow-500/10", border: "border-yellow-500/25", dot: "bg-yellow-400" },
  { min: 0,  label: "Likely human", bg: "bg-emerald-500/10", border: "border-emerald-500/20", dot: "bg-emerald-400" },
];

function getRiskLevel(score: number) {
  return RISK_LEVELS.find(r => score >= r.min) || RISK_LEVELS[RISK_LEVELS.length - 1];
}

export default function SentenceHighlight({ sentences }: SentenceHighlightProps) {
  const [tooltip, setTooltip] = useState<{ idx: number; x: number; y: number } | null>(null);

  if (!sentences || sentences.length === 0) return null;

  return (
    <div className="space-y-3">
      {/* Legend */}
      <div className="flex flex-wrap gap-2 text-xs">
        {RISK_LEVELS.map(r => (
          <div key={r.label} className="flex items-center gap-1.5">
            <div className={cn("w-2 h-2 rounded-full", r.dot)} />
            <span className="text-muted-foreground">{r.label}</span>
          </div>
        ))}
      </div>

      {/* Highlighted text */}
      <div className="relative leading-relaxed text-sm text-foreground font-[16px]">
        {sentences.map((s, i) => {
          const risk = getRiskLevel(s.aiScore);
          return (
            <span
              key={i}
              className={cn(
                "inline cursor-pointer rounded px-0.5 py-0.5 border transition-all duration-200 hover:opacity-80",
                risk.bg, risk.border
              )}
              onMouseEnter={e => {
                const rect = (e.target as HTMLElement).getBoundingClientRect();
                setTooltip({ idx: i, x: rect.left, y: rect.top });
              }}
              onMouseLeave={() => setTooltip(null)}
            >
              {s.text}{" "}
            </span>
          );
        })}
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
        {RISK_LEVELS.map(r => {
          const count = sentences.filter(s => s.aiScore >= r.min && (r.min === 0 ? true : s.aiScore < (RISK_LEVELS[RISK_LEVELS.indexOf(r) - 1]?.min ?? 101))).length;
          return (
            <div key={r.label} className={cn("rounded-lg px-3 py-2 border", r.bg, r.border)}>
              <div className={cn("text-lg font-bold font-mono", r.dot.replace("bg-", "text-"))}>{count}</div>
              <div className="text-xs text-muted-foreground leading-tight">{r.label}</div>
            </div>
          );
        })}
      </div>

      {/* Floating tooltip */}
      {tooltip !== null && sentences[tooltip.idx] && (
        <div
          className="fixed z-50 px-3 py-2 rounded-lg glass border border-border shadow-xl text-xs font-mono pointer-events-none"
          style={{ left: tooltip.x, top: tooltip.y - 48, transform: "translateX(-50%)" }}
        >
          AI Score: <span className={cn(getRiskLevel(sentences[tooltip.idx].aiScore).dot.replace("bg-", "text-"), "font-bold")}>
            {sentences[tooltip.idx].aiScore}%
          </span>
        </div>
      )}
    </div>
  );
}
