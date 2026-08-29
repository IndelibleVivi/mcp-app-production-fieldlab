import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/host",
  testMatch: "**/*.pw.ts",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  outputDir: "test-results/host",
  reporter: "line",
  use: {
    browserName: "chromium",
    headless: true,
    viewport: { width: 1440, height: 960 },
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
});
