export const VERDICT_CONFIG = {
  ai: {
    label: "AI Generated",
    color: "text-red-400",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/30",
    glowClass: "glow-red",
    barColor: "bg-red-500",
    dotColor: "bg-red-400",
    description: "High likelihood of AI authorship",
  },
  mixed: {
    label: "AI + Human Mix",
    color: "text-orange-400",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/30",
    glowClass: "",
    barColor: "bg-orange-500",
    dotColor: "bg-orange-400",
    description: "Contains both AI and human elements",
  },
  uncertain: {
    label: "Uncertain",
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/30",
    glowClass: "",
    barColor: "bg-yellow-500",
    dotColor: "bg-yellow-400",
    description: "Inconclusive — borderline result",
  },
  human: {
    label: "Human Written",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
    glowClass: "glow-green",
    barColor: "bg-emerald-500",
    dotColor: "bg-emerald-400",
    description: "Strong indicators of human authorship",
  },
} as const;

export const MAX_TEXT_CHARS = 100000;
export const MIN_TEXT_CHARS = 50;

export const ADMIN_EMAIL = "kalebbereket49@gmail.com";
