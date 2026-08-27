export type ContentType = "text" | "image" | "document";
export type Verdict = "human" | "ai" | "mixed" | "uncertain";

export interface DetectionFeature {
  name: string;
  score: number; // 0-100, percentage of AI probability
  description: string;
}

export interface SentenceAnalysis {
  text: string;
  aiScore: number; // 0-100
  isHighRisk: boolean;
}

export interface DetectionResult {
  id: string;
  contentType: ContentType;
  verdict: Verdict;
  aiProbability: number; // 0-100
  humanProbability: number; // 0-100
  confidence: number; // 0-100 how confident the detector is
  features: DetectionFeature[];
  analyzedAt: Date;
  wordCount?: number;
  fileName?: string;
  summary: string;
  sentences?: SentenceAnalysis[]; // sentence-level breakdown for text
}

export interface HistoryEntry {
  id: string;
  contentType: ContentType;
  verdict: Verdict;
  aiProbability: number;
  analyzedAt: Date;
  preview: string;
  fileName?: string;
}
