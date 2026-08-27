import { Clock, Trash2, FileText, Image, FileSpreadsheet } from "lucide-react";
import type { HistoryEntry } from "@/types/detection";
import { VERDICT_CONFIG } from "@/constants";
import { cn } from "@/lib/utils";

const TYPE_ICONS = { text: FileText, image: Image, document: FileSpreadsheet };

interface HistoryPanelProps {
  history: HistoryEntry[];
  onClear: () => void;
}

export default function HistoryPanel({ history, onClear }: HistoryPanelProps) {
  if (history.length === 0) {
    return (
      <div className="glass rounded-2xl p-6 text-center">
        <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">No analysis history yet.</p>
        <p className="text-xs text-muted-foreground mt-1">Your recent scans will appear here.</p>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Clock className="w-4 h-4 text-primary" />
          Recent Scans ({history.length})
        </div>
        <button
          onClick={onClear}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors"
        >
          <Trash2 className="w-3 h-3" />
          Clear
        </button>
      </div>
      <div className="divide-y divide-border max-h-80 overflow-y-auto">
        {history.map(entry => {
          const config = VERDICT_CONFIG[entry.verdict];
          const Icon = TYPE_ICONS[entry.contentType];
          return (
            <div key={entry.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/20 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center flex-shrink-0">
                <Icon className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-foreground truncate">
                  {entry.fileName || entry.preview || "Untitled"}
                </p>
                <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                  {new Date(entry.analyzedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              <div className={cn("flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-mono font-medium", config.bgColor, config.color)}>
                <div className={cn("w-1.5 h-1.5 rounded-full", config.dotColor)} />
                {entry.aiProbability}% AI
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
