import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000";
const externalServer = Boolean(process.env.PLAYWRIGHT_BASE_URL);

export default defineConfig({
  testDir: "./tests/e2e",
  outputDir: "./test-results/playwright",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 5"] } },
  ],
  webServer: externalServer
    ? undefined
    : {
        command:
          process.env.PLAYWRIGHT_WEB_SERVER_COMMAND ??
          "corepack pnpm dev --hostname 127.0.0.1",
        url: baseURL,
        reuseExistingServer: true,
        timeout: 120_000,
      },
});
