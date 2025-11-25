import { copyFileSync, mkdirSync } from "fs";
import { dirname, resolve } from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { fileURLToPath } from "url";

const outDir = "dist";
const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, "src");

const copyManifestPlugin = () => ({
  name: "copy-manifest",
  apply: "build",
  closeBundle() {
    mkdirSync(resolve(__dirname, outDir), { recursive: true });
    copyFileSync(
      resolve(__dirname, "manifest.json"),
      resolve(__dirname, outDir, "manifest.json")
    );
  },
});

export default defineConfig({
  root: rootDir,
  base: "./",
  plugins: [react(), copyManifestPlugin()],
  publicDir: resolve(__dirname, "public"),
  build: {
    outDir: resolve(__dirname, outDir),
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      input: {
        popup: resolve(rootDir, "ui/popup.html"),
        sidepanel: resolve(rootDir, "ui/sidepanel.html"),
        options: resolve(rootDir, "ui/options.html"),
        background: resolve(rootDir, "background/index.js"),
        content: resolve(rootDir, "content/selectionListener.js"),
      },
      output: {
        entryFileNames: (chunk) => {
          if (chunk.name === "background") return "background/index.js";
          if (chunk.name === "content") return "content/selectionListener.js";
          return "assets/[name].js";
        },
        chunkFileNames: "assets/[name].js",
        assetFileNames: "assets/[name][extname]",
      },
    },
  },
});
