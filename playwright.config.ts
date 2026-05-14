import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.E2E_PORT ?? 3030);
const BASE_URL = process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`;
const API_URL = process.env.E2E_API_URL ?? "http://127.0.0.1:8000";

/**
 * E2E config.
 *
 * Run locally: `npm run dev` (Next.js) + `./run.sh` (API) in two terminals,
 * then `npm run e2e`.
 *
 * webServer auto-starts the Next dev server when you only want the frontend
 * piece — the API still has to be running separately because we point
 * NEXT_PUBLIC_API_URL at it.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false, // these tests share a backend account; run serially
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    actionTimeout: 10_000,
    navigationTimeout: 20_000,
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    command: `npm run dev -- --port ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: true,
    timeout: 60_000,
    env: {
      NEXT_PUBLIC_API_URL: API_URL,
    },
  },
});
