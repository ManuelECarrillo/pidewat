import { defineConfig, devices } from "@playwright/test";

// La matriz replica los tamaños de los anuncios; WebKit es emulación, no un iPhone físico.
export default defineConfig({
  testDir: ".",
  testMatch: "compatibilidad.spec.ts",
  timeout: 45_000,
  // Las capturas comparten una carpeta legible por marketing; así no se pisan entre proyectos.
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  reporter: [["list"]],
  use: {
    baseURL: process.env.QA_BASE_URL || "http://127.0.0.1:3000",
    storageState: process.env.QA_PANEL_STORAGE_STATE || undefined,
    trace: "retain-on-failure",
    video: "retain-on-failure",
  },
  webServer: process.env.QA_BASE_URL ? undefined : {
    // La QA se ejecuta contra el build validado; si no hubiera build disponible,
    // se cambia temporalmente a `npm run dev` para la ejecuciÃ³n local.
    command: "npm run start",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: true,
    timeout: 120_000,
  },
  projects: [
    { name: "pixel-5-360", use: { browserName: "chromium", viewport: { width: 360, height: 800 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 } },
    { name: "iphone-13-webkit", use: { ...devices["iPhone 13"] } },
    { name: "ipad-mini", use: { ...devices["iPad Mini"] } },
    { name: "escritorio-1440", use: { browserName: "chromium", viewport: { width: 1440, height: 900 } } },
  ],
});
