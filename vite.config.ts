import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/AIDetect/",
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Raise warning threshold to reduce noise; real splitting is done below
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React runtime — tiny, cached aggressively
          "vendor-react": ["react", "react-dom"],
          // Router — loaded once, rarely changes
          "vendor-router": ["react-router-dom"],
          // Data-fetching
          "vendor-query": ["@tanstack/react-query"],
          // Supabase client
          "vendor-supabase": ["@supabase/supabase-js"],
          // Radix UI / shadcn primitives
          "vendor-ui": [
            "@radix-ui/react-tooltip",
            "@radix-ui/react-tabs",
            "@radix-ui/react-slot",
            "@radix-ui/react-progress",
            "@radix-ui/react-toast",
          ],
          // Charts (recharts is large — isolate it)
          "vendor-charts": ["recharts"],
          // Icons
          "vendor-icons": ["lucide-react"],
          // Toasts
          "vendor-sonner": ["sonner"],
        },
      },
    },
  },
});