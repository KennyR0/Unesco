import { fileURLToPath } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@antidoto/contracts": fileURLToPath(new URL("./specs/001-trivia-mvp-flow/contracts/domain.ts", import.meta.url)),
      "server-only": fileURLToPath(new URL("./tests/setup/server-only-shim.ts", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["tests/integration/**/*.test.ts"],
    testTimeout: 30_000,
    hookTimeout: 30_000,
    fileParallelism: false,
    setupFiles: [],
  },
});
