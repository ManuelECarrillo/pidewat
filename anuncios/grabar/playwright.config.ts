import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: ".",
  testMatch: "*.spec.ts",
  timeout: 120_000,
  workers: 1,
  use: {
    baseURL: process.env.GRABACION_BASE_URL || "http://127.0.0.1:3001",
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    video: "off",
  },
});
