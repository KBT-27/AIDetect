import { useState, useRef, useCallback } from "react";
import { analyzeContent } from "@/lib/detection-engine";
import { supabase } from "@/lib/supabase";
import type { ContentType, DetectionResult } from "@/types/detection";
import { toast } from "sonner";

type DetectionState = "idle" | "analyzing" | "complete" | "error";

export function useDetection(userId?: string, userEmail?: string) {
  const [state, setState] = useState<DetectionState>("idle");
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [progress, setProgress] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  const analyze = useCallback(async (contentType: ContentType, content: string | File) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setState("analyzing");
    setResult(null);
    setProgress(0);

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 85) { clearInterval(progressInterval); return 85; }
        return prev + Math.random() * 12;
      });
    }, 300);

    try {
      const detectionResult = await analyzeContent(contentType, content, controller.signal);
      clearInterval(progressInterval);
      setProgress(100);
      await new Promise(r => setTimeout(r, 300));
      setResult(detectionResult);
      setState("complete");

      // Log to database
      const wordCount = typeof content === "string"
        ? content.split(/\s+/).filter(Boolean).length
        : undefined;
      const fileName = content instanceof File ? content.name : undefined;

      supabase.from("analysis_logs").insert({
        user_id: userId || null,
        user_email: userEmail || null,
        content_type: contentType,
        verdict: detectionResult.verdict,
        ai_probability: detectionResult.aiProbability,
        confidence: detectionResult.confidence,
        word_count: wordCount,
        file_name: fileName,
      }).then(({ error }) => {
        if (error) console.log("Log insert error:", error.message);
      });

    } catch (err) {
      clearInterval(progressInterval);
      if ((err as DOMException).name === "AbortError") return;
      setState("error");
      toast.error("Analysis failed. Please try again.");
      console.error("Detection error:", err);
    }
  }, [userId, userEmail]);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setState("idle");
    setResult(null);
    setProgress(0);
  }, []);

  return { state, result, progress, analyze, reset };
}
