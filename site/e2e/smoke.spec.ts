import { test, expect } from "@playwright/test";

// ── All page routes that should return 200 ──────────────────────────
const routes = [
  "/",
  ...Array.from({ length: 12 }, (_, i) => `/week/${i + 1}`),
  ...["a", "b", "c", "d", "e", "f", "g", "h", "i"].map(
    (l) => `/appendix/${l}`
  ),
  "/sitemap.xml",
  "/robots.txt",
];

test.describe("Smoke: HTTP Status Codes", () => {
  for (const route of routes) {
    test(`${route} returns 200`, async ({ page }) => {
      const response = await page.goto(route);
      expect(response?.status()).toBe(200);
    });
  }
});

test.describe("Smoke: 404 Page", () => {
  test("unknown route returns 404 with correct content", async ({ page }) => {
    const response = await page.goto("/this-page-does-not-exist");
    expect(response?.status()).toBe(404);
    await expect(page.locator("text=Page Not Found")).toBeVisible();
    await expect(page.getByRole("link", { name: "Back to Home" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Start Week 1" })).toBeVisible();
  });
});

test.describe("Smoke: No Console Errors", () => {
  test("homepage has no uncaught errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    expect(errors).toHaveLength(0);
  });

  test("week page has no uncaught errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await page.goto("/week/1");
    await page.waitForLoadState("networkidle");
    expect(errors).toHaveLength(0);
  });
});
