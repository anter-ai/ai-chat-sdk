import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: "@anter/ai-chat-sdk/styles.css",
        replacement: path.resolve(root, "../../src/styles/styles.css"),
      },
      {
        find: "@anter/ai-chat-sdk",
        replacement: path.resolve(root, "../../src/index.ts"),
      },
    ],
    dedupe: ["react", "react-dom"],
  },
  server: {
    port: 5173,
  },
});
