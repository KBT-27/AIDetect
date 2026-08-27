import { useState } from "react";
import type { ContentType } from "@/types/detection";
import { useDetection } from "@/hooks/useDetection";
import { useHistory } from "@/hooks/useHistory";
import { useAuth } from "@/context/AuthContext";
import { MIN_TEXT_CHARS, MAX_TEXT_CHARS } from "@/constants";
import TabSelector from "./TabSelector";
import TextInput from "./TextInput";
import FileUpload from "./FileUpload";
import AnalyzeButton from "./AnalyzeButton";
import ResultPanel from "./ResultPanel";
import HistoryPanel from "./HistoryPanel";

export default function DetectorPanel() {
  const [activeTab, setActiveTab] = useState<ContentType>("text");
  const [textContent, setTextContent] = useState("");
  const [fileContent, setFileContent] = useState<File | null>(null);
  const { user } = useAuth();

  const { state, result, progress, analyze, reset } = useDetection(user?.id, user?.email);
  const { history, addEntry, clearHistory } = useHistory();

  const handleTabChange = (tab: ContentType) => {
    setActiveTab(tab);
    reset();
  };

  const isReadyToAnalyze = () => {
    if (state === "analyzing") return false;
    if (activeTab === "text") {
      return textContent.length >= MIN_TEXT_CHARS && textContent.length <= MAX_TEXT_CHARS;
    }
    return fileContent !== null;
  };

  const handleAnalyze = () => {
    if (!isReadyToAnalyze()) return;
    const content = activeTab === "text" ? textContent : fileContent!;
    analyze(activeTab, content);
  };

  if (result && state === "complete") {
    const preview = activeTab === "text" ? textContent : (fileContent?.name || "");
    if (!history.find(h => h.id === result.id)) {
      addEntry(result, preview);
    }
  }

  return (
    <div className="grid lg:grid-cols-5 gap-6">
      {/* Left: Input Panel */}
      <div className="lg:col-span-2 space-y-5">
        <div className="glass rounded-2xl p-5 space-y-5">
          <TabSelector active={activeTab} onChange={handleTabChange} />

          {activeTab === "text" ? (
            <TextInput
              value={textContent}
              onChange={setTextContent}
              disabled={state === "analyzing"}
            />
          ) : (
            <FileUpload
              contentType={activeTab}
              file={fileContent}
              onFileChange={setFileContent}
              disabled={state === "analyzing"}
            />
          )}

          <AnalyzeButton
            state={state}
            disabled={!isReadyToAnalyze()}
            progress={progress}
            onAnalyze={handleAnalyze}
            onReset={() => {
              reset();
              setTextContent("");
              setFileContent(null);
            }}
          />
        </div>
        <HistoryPanel history={history} onClear={clearHistory} />
      </div>

      {/* Right: Result Panel */}
      <div className="lg:col-span-3">
        {state === "idle" && !result && (
          <div className="glass rounded-2xl h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 gap-4">
            <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full border-2 border-dashed border-primary/50 flex items-center justify-center animate-spin-slow">
                <div className="w-4 h-4 rounded-full bg-primary/50" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Ready to Scan</h3>
              <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                Enter text (up to 100,000 characters) or upload a file, then click "Analyze Content" to get a detailed AI detection report.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-2 w-full max-w-sm">
              {["Text Analysis", "Image Scan", "Doc Review"].map(label => (
                <div key={label} className="glass-light rounded-lg p-3 text-center">
                  <div className="text-xs text-muted-foreground">{label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {(state === "analyzing" || state === "complete") && result && (
          <ResultPanel result={result} />
        )}

        {state === "analyzing" && !result && (
          <div className="glass rounded-2xl h-full min-h-[400px] flex flex-col items-center justify-center p-8 gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-2 border-primary/30" />
              <div className="absolute inset-0 w-24 h-24 rounded-full border-2 border-primary/60 animate-ping" />
              <div className="absolute inset-3 rounded-full bg-primary/10 flex items-center justify-center">
                <div className="w-6 h-6 rounded-full bg-primary/40 animate-pulse" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold text-foreground">Analyzing Content</h3>
              <p className="text-sm text-muted-foreground">Running detection algorithms...</p>
              <p className="text-xs font-mono text-primary">{Math.round(progress)}% complete</p>
            </div>
            <div className="w-full max-w-xs space-y-1.5 font-mono text-xs text-muted-foreground">
              {["Tokenizing input...", "Running perplexity model...", "Analyzing burstiness...", "Stylometric analysis...", "Cross-referencing patterns..."].map((log, i) => (
                <div key={log} className="flex items-center gap-2" style={{ opacity: progress > i * 18 ? 1 : 0.2, transition: "opacity 0.5s" }}>
                  <span className="text-primary">›</span>
                  {log}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
