import { test, expect } from "@playwright/test";

// Helper to find the visible theme toggle (desktop has it in a different container than mobile)
function getToggle(page: import("@playwright/test").Page) {
  return page.locator("button[aria-label*='Switch to']").locator("visible=true");
}

test.describe("Dark Mode: Toggle", () => {
  test.beforeEach(async ({ page }) => {
    // Force light color scheme so the toggle tests always start from light mode,
    // regardless of which Playwright project (desktop vs dark-mode) runs them.
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    // Ensure we start in light mode
    await expect(page.locator("html")).toHaveClass(/light/);
  });

  test("clicking toggle activates dark mode class", async ({ page }) => {
    const toggle = getToggle(page);
    await toggle.click();
    await expect(page.locator("html")).toHaveClass(/dark/);
  });

  test("clicking toggle twice returns to light mode", async ({ page }) => {
    const toggle = getToggle(page);

    // Click to dark
    await toggle.click();
    await expect(page.locator("html")).toHaveClass(/dark/);

    // Click back to light — need to re-query since aria-label changed
    const toggleBack = getToggle(page);
    await toggleBack.click();
    await expect(page.locator("html")).not.toHaveClass(/dark/);
  });

  test("dark mode changes background color", async ({ page }) => {
    const toggle = getToggle(page);
    await toggle.click();
    await expect(page.locator("html")).toHaveClass(/dark/);

    // Body should have dark background
    const bg = await page.evaluate(() =>
      getComputedStyle(document.body).backgroundColor
    );
    // #0a0a0a = rgb(10, 10, 10)
    expect(bg).toBe("rgb(10, 10, 10)");
  });
});

// This test runs in the "dark-mode" project which sets colorScheme: 'dark'
// next-themes with defaultTheme='system' should detect this and apply dark class
test.describe("Dark Mode: System Preference", () => {
  test("page respects system dark preference via emulation", async ({
    page,
  }) => {
    // Emulate dark color scheme at page level (for the dark-mode project)
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    // next-themes should detect prefers-color-scheme: dark and apply the class
    // Give it a moment for client-side hydration
    await page.waitForTimeout(2000);

    // next-themes should detect prefers-color-scheme: dark and apply the class
    await expect(page.locator("html")).toHaveClass(/dark/);
  });
});

test.describe("Dark Mode: Week Page", () => {
  test("dark mode works on content pages", async ({ page }) => {
    // Force light so toggling goes to dark
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/week/1");
    await page.waitForLoadState("domcontentloaded");

    const toggle = getToggle(page);
    await toggle.click();
    await expect(page.locator("html")).toHaveClass(/dark/);

    // Phase badge should still be visible
    const phaseBadge = page.locator("text=PHASE 1").first();
    await expect(phaseBadge).toBeVisible();

    // Heading should still be visible
    await expect(page.locator("h1")).toBeVisible();
  });
});
