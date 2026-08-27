import { useCallback, useState } from "react";
import { Upload, File, X, Image as ImageIcon, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ContentType } from "@/types/detection";

const ACCEPT_MAP: Record<ContentType, { accept: string; label: string; extensions: string[] }> = {
  image: {
    accept: "image/jpeg,image/png,image/webp,image/gif,image/bmp",
    label: "image",
    extensions: ["JPG", "PNG", "WEBP", "GIF", "BMP"]
  },
  document: {
    accept: ".pdf,.pptx,.ppt,.docx,.doc,.txt",
    label: "document",
    extensions: ["PDF", "PPTX", "DOCX", "TXT"]
  },
  text: { accept: "", label: "text", extensions: [] }
};

interface FileUploadProps {
  contentType: ContentType;
  file: File | null;
  onFileChange: (file: File | null) => void;
  disabled?: boolean;
}

export default function FileUpload({ contentType, file, onFileChange, disabled }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const config = ACCEPT_MAP[contentType];

  const handleFile = useCallback((f: File) => {
    onFileChange(f);
    if (contentType === "image") {
      const reader = new FileReader();
      reader.onload = e => setPreview(e.target?.result as string);
      reader.readAsDataURL(f);
    } else {
      setPreview(null);
    }
  }, [contentType, onFileChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFile(dropped);
  }, [handleFile]);

  const handleRemove = () => {
    onFileChange(null);
    setPreview(null);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (file) {
    return (
      <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
        <div className="flex items-center gap-3">
          {preview ? (
            <img src={preview} alt="preview" className="w-16 h-16 object-cover rounded-lg border border-border" />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
              <FileText className="w-6 h-6 text-muted-foreground" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate text-foreground">{file.name}</p>
            <p className="text-xs text-muted-foreground font-mono mt-0.5">{formatSize(file.size)}</p>
            <p className="text-xs text-primary mt-1">Ready for analysis</p>
          </div>
          <button
            onClick={handleRemove}
            disabled={disabled}
            className="p-1.5 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <label
      className={cn(
        "flex flex-col items-center justify-center h-48 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200",
        isDragging
          ? "border-primary bg-primary/10 scale-[1.01]"
          : "border-border bg-muted/20 hover:border-primary/50 hover:bg-muted/30",
        disabled && "opacity-50 cursor-not-allowed"
      )}
      onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept={config.accept}
        className="hidden"
        onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
        disabled={disabled}
      />
      <div className="flex flex-col items-center gap-3 text-center px-6">
        {contentType === "image" ? (
          <ImageIcon className={cn("w-10 h-10 transition-colors", isDragging ? "text-primary" : "text-muted-foreground")} />
        ) : (
          <Upload className={cn("w-10 h-10 transition-colors", isDragging ? "text-primary" : "text-muted-foreground")} />
        )}
        <div>
          <p className="text-sm font-medium text-foreground">
            {isDragging ? "Drop to upload" : `Drop your ${config.label} here`}
          </p>
          <p className="text-xs text-muted-foreground mt-1">or click to browse</p>
        </div>
        <div className="flex flex-wrap justify-center gap-1.5">
          {config.extensions.map(ext => (
            <span key={ext} className="px-2 py-0.5 rounded text-[10px] font-mono bg-muted text-muted-foreground border border-border">
              {ext}
            </span>
          ))}
        </div>
      </div>
    </label>
  );
}
