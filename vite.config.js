import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          // Split React core
          "vendor-react": ["react", "react-dom", "react/jsx-runtime"],
          // Split Recharts (heavy - ~400KB)
          "vendor-recharts": ["recharts"],
          // Split Framer Motion (heavy - ~100KB)
          "vendor-motion": ["framer-motion"],
          // Split UI components
          "vendor-ui": [
            "lucide-react",
            "class-variance-authority",
            "clsx",
            "tailwind-merge",
          ],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
})

