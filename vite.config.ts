import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

// Persönliche Startdaten nur lokal. Auf GitHub (PUBLIC_BUILD=1) oder ohne den Ordner startet die App leer.
const usePrivateSeed = process.env.PUBLIC_BUILD !== "1" && existsSync(new URL("./src/seed/private/data.ts", import.meta.url));
const seedData = fileURLToPath(new URL(usePrivateSeed ? "./src/seed/private/data.ts" : "./src/seed/data-empty.ts", import.meta.url));

export default defineConfig({
  // Relativer Pfad: läuft unter http://<ip>:5173/ genauso wie unter https://<name>.github.io/skill-app/
  base: "./",
  resolve: { alias: { "@seed-data": seedData } },
  server: { host: true, port: 5173 },
  // Die Startdaten (192 Einträge mit Steckbriefen) sind eingebaut – daher etwas größer.
  build: { chunkSizeWarningLimit: 900 },
  plugins: [
    react(),
    VitePWA({
      registerType: "prompt",
      injectRegister: "auto",
      includeAssets: ["favicon.ico", "favicon.svg", "apple-touch-icon-180x180.png"],
      manifest: {
        name: "Skills",
        short_name: "Skills",
        description: "Skills sammeln, lernen und Lernzeit erfassen.",
        lang: "de",
        start_url: "./",
        scope: "./",
        display: "standalone",
        orientation: "any",
        background_color: "#F5F0E8",
        theme_color: "#F5F0E8",
        icons: [
          { src: "pwa-64x64.png", sizes: "64x64", type: "image/png" },
          { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa-512x512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          { src: "maskable-icon-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,ico,woff2}"],
        globIgnores: ["splash/**"],
        navigateFallback: "index.html",
      },
    }),
  ],
});
