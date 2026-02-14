import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.DEPLOYMENT_URL || "http://localhost:3000";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI
    ? [["github"], ["json", { outputFile: "test-results/results.json" }], ["html", { open: "never" }]]
    : [["html", { open: "on-failure" }]],
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"] },
      testIgnore: /responsive\.spec\.ts/,
    },
    {
      name: "mobile",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      },
      testMatch: /responsive\.spec\.ts/,
    },
    {
      name: "dark-mode",
      use: {
        ...devices["Desktop Chrome"],
        colorScheme: "dark",
      },
      testMatch: /dark-mode\.spec\.ts/,
    },
  ],

  /* Start local dev server if no DEPLOYMENT_URL */
  ...(process.env.DEPLOYMENT_URL
    ? {}
    : {
        webServer: {
          command: "npm run dev",
          url: "http://localhost:3000",
          reuseExistingServer: !process.env.CI,
          timeout: 30_000,
        },
      }),
});
