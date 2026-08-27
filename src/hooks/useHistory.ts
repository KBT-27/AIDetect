import { useState, useEffect } from "react";
import type { DetectionResult, HistoryEntry } from "@/types/detection";

const STORAGE_KEY = "aidetect_history";
const MAX_HISTORY = 20;

export function useHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }, [history]);

  const addEntry = (result: DetectionResult, preview: string) => {
    const entry: HistoryEntry = {
      id: result.id,
      contentType: result.contentType,
      verdict: result.verdict,
      aiProbability: result.aiProbability,
      analyzedAt: result.analyzedAt,
      preview: preview.slice(0, 100),
      fileName: result.fileName,
    };
    setHistory(prev => [entry, ...prev].slice(0, MAX_HISTORY));
  };

  const clearHistory = () => setHistory([]);

  return { history, addEntry, clearHistory };
}
