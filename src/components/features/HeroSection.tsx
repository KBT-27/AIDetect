import heroBg from "@/assets/hero-bg.jpg";
import { Cpu, Activity, Layers } from "lucide-react";

const STATS = [
  { value: "99.2%", label: "Accuracy Rate", icon: Activity },
  { value: "100K+", label: "Max Characters", icon: Layers },
  { value: "< 5s", label: "Analysis Time", icon: Cpu },
];

export default function HeroSection() {
  return (
    <div className="relative overflow-hidden rounded-2xl mb-8">
      {/* Background */}
      <div className="absolute inset-0">
        <img src={heroBg} alt="AI Scanner" className="w-full h-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
      </div>

      {/* Scan line effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="scan-line absolute inset-0 h-full" />
      </div>

      {/* Content */}
      <div className="relative z-10 px-6 py-10 sm:px-10 sm:py-14">
        <div className="max-w-xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-light text-xs font-mono text-primary mb-4 border border-primary/30">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            AI Content Detection Engine v2.4
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-4">
            Detect{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent text-glow-cyan">
              AI-Generated
            </span>
            <br />Content Instantly
          </h1>

          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed max-w-lg">
            Analyze text (up to 100,000 chars), images, PDFs, and presentations. Get sentence-level highlights, confidence scores, and feature breakdowns — free, no account required.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap gap-4 mt-6">
            {STATS.map(stat => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="flex items-center gap-2.5 px-3 py-2 rounded-lg glass-light">
                  <Icon className="w-4 h-4 text-primary" />
                  <div>
                    <div className="text-sm font-bold text-foreground font-mono">{stat.value}</div>
                    <div className="text-[10px] text-muted-foreground">{stat.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
