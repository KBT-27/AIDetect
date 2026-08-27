import Navbar from "@/components/layout/Navbar";
import HeroSection from "@/components/features/HeroSection";
import DetectorPanel from "@/components/features/DetectorPanel";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <HeroSection />
        <DetectorPanel />
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <span className="font-mono">AIDetect © {new Date().getFullYear()} — Free AI Content Scanner</span>
          <span className="font-mono">Results are probabilistic — not legal evidence</span>
        </div>
      </footer>
    </div>
  );
};

export default Index;
