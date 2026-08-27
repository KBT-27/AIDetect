import { Loader2, Scan, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnalyzeButtonProps {
  state: "idle" | "analyzing" | "complete" | "error";
  disabled: boolean;
  progress: number;
  onAnalyze: () => void;
  onReset: () => void;
}

export default function AnalyzeButton({ state, disabled, progress, onAnalyze, onReset }: AnalyzeButtonProps) {
  if (state === "complete") {
    return (
      <button
        onClick={onReset}
        className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-border bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground text-sm font-medium transition-all duration-200 w-full"
      >
        <RotateCcw className="w-4 h-4" />
        Analyze New Content
      </button>
    );
  }

  if (state === "analyzing") {
    return (
      <div className="space-y-3">
        <div className="relative flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary/10 border border-primary/30 text-primary text-sm font-medium w-full">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Scanning content... {Math.round(progress)}%</span>
        </div>
        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-violet-400 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={onAnalyze}
      disabled={disabled}
      className={cn(
        "flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold w-full transition-all duration-200",
        "bg-gradient-to-r from-primary to-cyan-300 text-primary-foreground",
        "hover:shadow-lg hover:shadow-primary/30 hover:scale-[1.01]",
        "active:scale-[0.99]",
        "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
      )}
    >
      <Scan className="w-4 h-4" />
      Analyze Content
    </button>
  );
}
