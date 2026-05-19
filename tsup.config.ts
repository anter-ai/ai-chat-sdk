import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: {
      index: "src/index.ts",
      "headless/index": "src/headless/index.ts",
      "ui/index": "src/ui/index.ts",
      "adapters/index": "src/adapters/index.ts",
      "headless/types/index": "src/headless/types/index.ts",
    },
    format: ["esm"],
    dts: false,
    splitting: true,
    sourcemap: true,
    clean: false,
    treeshake: true,
    external: ["react", "react-dom"],
  },
]);
