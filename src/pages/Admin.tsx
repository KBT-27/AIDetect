import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { ADMIN_EMAIL, VERDICT_CONFIG } from "@/constants";
import { Users, BarChart3, Activity, FileText, Image, FileSpreadsheet, ArrowLeft, TrendingUp, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Verdict } from "@/types/detection";

interface LogRow {
  id: string;
  user_email: string | null;
  content_type: string;
  verdict: string;
  ai_probability: number;
  confidence: number;
  word_count: number | null;
  file_name: string | null;
  created_at: string;
}

interface Stats {
  total: number;
  uniqueUsers: number;
  avgAiProb: number;
  byVerdict: Record<string, number>;
  byType: Record<string, number>;
  recent: LogRow[];
  todayCount: number;
}

const TYPE_ICONS = { text: FileText, image: Image, document: FileSpreadsheet };

export default function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate("/login", { replace: true }); return; }
    if (user.email !== ADMIN_EMAIL) { navigate("/", { replace: true }); return; }
    fetchStats();
  }, [user, navigate]);

  async function fetchStats() {
    setLoading(true);
    const { data, error } = await supabase
      .from("analysis_logs")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) { console.log("Admin fetch error:", error.message); setLoading(false); return; }
    const rows = (data || []) as LogRow[];

    const today = new Date().toISOString().split("T")[0];
    const todayCount = rows.filter(r => r.created_at.startsWith(today)).length;
    const uniqueEmails = new Set(rows.map(r => r.user_email).filter(Boolean));
    const avgAiProb = rows.length ? Math.round(rows.reduce((s, r) => s + r.ai_probability, 0) / rows.length) : 0;

    const byVerdict: Record<string, number> = {};
    const byType: Record<string, number> = {};
    rows.forEach(r => {
      byVerdict[r.verdict] = (byVerdict[r.verdict] || 0) + 1;
      byType[r.content_type] = (byType[r.content_type] || 0) + 1;
    });

    setStats({ total: rows.length, uniqueUsers: uniqueEmails.size, avgAiProb, byVerdict, byType, recent: rows.slice(0, 50), todayCount });
    setLoading(false);
  }

  if (loading || !stats) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-full border-2 border-primary/30 border-t-primary animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground font-mono">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const SUMMARY_CARDS = [
    { label: "Total Analyses", value: stats.total.toLocaleString(), icon: Activity, color: "text-primary" },
    { label: "Unique Users", value: stats.uniqueUsers.toLocaleString(), icon: Users, color: "text-violet-400" },
    { label: "Today's Scans", value: stats.todayCount.toLocaleString(), icon: TrendingUp, color: "text-emerald-400" },
    { label: "Avg AI Probability", value: stats.avgAiProb + "%", icon: BarChart3, color: "text-orange-400" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border sticky top-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/")} className="p-2 rounded-lg hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-sm font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-xs text-muted-foreground font-mono">{ADMIN_EMAIL}</p>
            </div>
          </div>
          <button onClick={fetchStats} className="text-xs text-primary hover:underline font-mono">Refresh</button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {SUMMARY_CARDS.map(card => {
            const Icon = card.icon;
            return (
              <div key={card.label} className="glass rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{card.label}</span>
                  <Icon className={cn("w-4 h-4", card.color)} />
                </div>
                <div className={cn("text-3xl font-bold font-mono", card.color)}>{card.value}</div>
              </div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Verdict breakdown */}
          <div className="glass rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              Verdict Distribution
            </h3>
            <div className="space-y-3">
              {(["ai", "mixed", "uncertain", "human"] as Verdict[]).map(v => {
                const count = stats.byVerdict[v] || 0;
                const pct = stats.total ? Math.round((count / stats.total) * 100) : 0;
                const cfg = VERDICT_CONFIG[v];
                return (
                  <div key={v} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className={cn("w-2 h-2 rounded-full", cfg.dotColor)} />
                        <span className={cfg.color}>{cfg.label}</span>
                      </div>
                      <span className="font-mono text-muted-foreground">{count} ({pct}%)</span>
                    </div>
                    <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full transition-all duration-700", cfg.barColor)} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Content type breakdown */}
          <div className="glass rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              Content Type Usage
            </h3>
            <div className="space-y-3">
              {(["text", "image", "document"] as const).map(type => {
                const count = stats.byType[type] || 0;
                const pct = stats.total ? Math.round((count / stats.total) * 100) : 0;
                const Icon = TYPE_ICONS[type];
                const colors = { text: "bg-cyan-500 text-cyan-400", image: "bg-violet-500 text-violet-400", document: "bg-orange-500 text-orange-400" };
                return (
                  <div key={type} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Icon className={cn("w-3.5 h-3.5", colors[type].split(" ")[1])} />
                        <span className="text-foreground capitalize">{type}</span>
                      </div>
                      <span className="font-mono text-muted-foreground">{count} ({pct}%)</span>
                    </div>
                    <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full transition-all duration-700", colors[type].split(" ")[0])} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent analyses table */}
        <div className="glass rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            Recent Analyses
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-muted-foreground pb-3 pr-4 font-medium">User</th>
                  <th className="text-left text-muted-foreground pb-3 pr-4 font-medium">Type</th>
                  <th className="text-left text-muted-foreground pb-3 pr-4 font-medium">Verdict</th>
                  <th className="text-left text-muted-foreground pb-3 pr-4 font-medium">AI %</th>
                  <th className="text-left text-muted-foreground pb-3 pr-4 font-medium">Words</th>
                  <th className="text-left text-muted-foreground pb-3 font-medium">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {stats.recent.map(row => {
                  const cfg = VERDICT_CONFIG[row.verdict as Verdict] || VERDICT_CONFIG.uncertain;
                  const Icon = TYPE_ICONS[row.content_type as keyof typeof TYPE_ICONS] || FileText;
                  return (
                    <tr key={row.id} className="hover:bg-muted/20 transition-colors">
                      <td className="py-2.5 pr-4 font-mono text-muted-foreground max-w-[140px] truncate">
                        {row.user_email || "anonymous"}
                      </td>
                      <td className="py-2.5 pr-4">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Icon className="w-3.5 h-3.5" />
                          <span className="capitalize">{row.content_type}</span>
                        </div>
                      </td>
                      <td className="py-2.5 pr-4">
                        <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", cfg.bgColor, cfg.color)}>
                          {cfg.label}
                        </span>
                      </td>
                      <td className={cn("py-2.5 pr-4 font-mono font-semibold", cfg.color)}>{row.ai_probability}%</td>
                      <td className="py-2.5 pr-4 font-mono text-muted-foreground">{row.word_count || "—"}</td>
                      <td className="py-2.5 font-mono text-muted-foreground">
                        {new Date(row.created_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </td>
                    </tr>
                  );
                })}
                {stats.recent.length === 0 && (
                  <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">No analyses yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
