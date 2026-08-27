import { FileText, Image, FileSpreadsheet } from "lucide-react";
import type { ContentType } from "@/types/detection";
import { cn } from "@/lib/utils";

const TABS: { id: ContentType; label: string; icon: React.ComponentType<{className?: string}>; description: string }[] = [
  { id: "text", label: "Text", icon: FileText, description: "Paste or type content" },
  { id: "image", label: "Image", icon: Image, description: "JPG, PNG, WEBP, GIF" },
  { id: "document", label: "Document", icon: FileSpreadsheet, description: "PDF, PPTX, DOCX" },
];

interface TabSelectorProps {
  active: ContentType;
  onChange: (type: ContentType) => void;
}

export default function TabSelector({ active, onChange }: TabSelectorProps) {
  return (
    <div className="flex gap-2 p-1 rounded-xl glass-light">
      {TABS.map(tab => {
        const Icon = tab.icon;
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
              isActive
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
