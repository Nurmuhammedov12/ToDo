import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // (npm run dev) /api in backend
    proxy: { "/api": "http://localhost:5000" },
  },
});