import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root,
  base: "./",
  server: {
    port: 5173,
  },
  build: {
    // Keep artifacts inside hf-prototype/ (not the monorepo root)
    outDir: "dist",
    emptyOutDir: true,
  },
});
