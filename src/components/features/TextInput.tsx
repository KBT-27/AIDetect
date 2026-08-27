import { useState } from "react";
import { AlertCircle, Type } from "lucide-react";
import { cn } from "@/lib/utils";
import { MAX_TEXT_CHARS, MIN_TEXT_CHARS } from "@/constants";

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export default function TextInput({ value, onChange, disabled }: TextInputProps) {
  const charCount = value.length;
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
  const tooShort = charCount > 0 && charCount < MIN_TEXT_CHARS;
  const tooLong = charCount > MAX_TEXT_CHARS;
  const pct = Math.min((charCount / MAX_TEXT_CHARS) * 100, 100);

  return (
    <div className="space-y-3">
      <div className="relative">
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          disabled={disabled}
          placeholder="Paste your text here to analyze... (minimum 50 characters)"
          className={cn(
            "w-full h-52 resize-none rounded-xl p-4 pb-10 text-sm leading-relaxed",
            "bg-muted/40 border text-foreground placeholder:text-muted-foreground/50",
            "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50",
            "transition-all duration-200",
            tooLong ? "border-destructive/50 focus:ring-destructive/50" : "border-border",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          maxLength={MAX_TEXT_CHARS + 100}
        />
        {/* Stats bar */}
        <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <Type className="w-3 h-3" />
            <span className="font-mono">{wordCount} words</span>
            <span className="font-mono">{charCount.toLocaleString()} chars</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-16 h-1 rounded-full bg-muted overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all duration-300", tooLong ? "bg-destructive" : pct > 70 ? "bg-orange-400" : "bg-primary")}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className={cn("font-mono", tooLong && "text-destructive")}>{charCount}/{MAX_TEXT_CHARS}</span>
          </div>
        </div>
      </div>

      {tooShort && (
        <div className="flex items-center gap-2 text-xs text-orange-400 px-1">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>Please enter at least {MIN_TEXT_CHARS} characters for reliable detection.</span>
        </div>
      )}
      {tooLong && (
        <div className="flex items-center gap-2 text-xs text-destructive px-1">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>Text exceeds the maximum limit of {MAX_TEXT_CHARS.toLocaleString()} characters.</span>
        </div>
      )}
    </div>
  );
}
