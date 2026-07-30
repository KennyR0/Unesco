import { fileURLToPath } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@antidoto/contracts": fileURLToPath(
        new URL(
          "./specs/001-trivia-mvp-flow/contracts/domain.ts",
          import.meta.url,
        ),
      ),
      "server-only": fileURLToPath(
        new URL("./tests/setup/server-only-shim.ts", import.meta.url),
      ),
    },
  },
  test: {
    environment: "jsdom",
    include: ["src/**/*.{test,spec}.{ts,tsx}", "tests/**/*.test.{ts,tsx}"],
    exclude: ["tests/e2e/**", "tests/integration/**"],
    setupFiles: [
      "./tests/setup/vitest.setup.ts",
      "./tests/setup/testing-library.setup.ts",
    ],
    passWithNoTests: true,
  },
});
