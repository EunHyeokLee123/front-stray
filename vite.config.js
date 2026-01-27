import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import Sitemap from "vite-plugin-sitemap";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // ✅ sitemap 자동 생성
    Sitemap({
      hostname: "https://nyangmong.com",
    }),
  ],
});
