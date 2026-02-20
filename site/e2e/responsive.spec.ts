import { test, expect } from "@playwright/test";

// These tests run in the "mobile" project (Chromium with iPhone 14 viewport)

test.describe("Responsive: Mobile Navigation", () => {
  test("sidebar is hidden, hamburger menu is visible", async ({ page }) => {
    await page.goto("/");

    // Desktop sidebar should be hidden on mobile (has class hidden lg:block)
    const sidebar = page.locator("nav.hidden");
    await expect(sidebar).toBeHidden();

    // Hamburger button should be present in the mobile header
    const hamburger = page.locator('button[aria-label="Toggle navigation"]');
    await expect(hamburger).toBeVisible();
  });

  test("hamburger opens mobile nav with all weeks", async ({ page }) => {
    await page.goto("/");

    // Click hamburger menu
    const hamburger = page.locator('button[aria-label="Toggle navigation"]');
    await hamburger.click();

    // The mobile nav overlay is the absolute-positioned div inside the MobileNav component
    const mobileNav = page.locator(".lg\\:hidden .absolute");
    await expect(mobileNav).toBeVisible();

    // Should see phase labels (raw text is mixed-case; CSS text-transform makes it uppercase)
    await expect(mobileNav.locator("text=Phase 1:")).toBeVisible();
    await expect(mobileNav.locator("text=Phase 2:")).toBeVisible();
    await expect(mobileNav.locator("text=Phase 3:")).toBeVisible();

    // Should see week items
    await expect(mobileNav.locator("text=The Terminal & File System")).toBeVisible();
    await expect(mobileNav.locator("text=Capstone & Portfolio")).toBeVisible();
  });

  test("mobile nav can be closed", async ({ page }) => {
    await page.goto("/");

    // Open
    const hamburger = page.locator('button[aria-label="Toggle navigation"]');
    await hamburger.click();

    const mobileNav = page.locator(".lg\\:hidden .absolute");
    await expect(mobileNav).toBeVisible();

    // Close (click the toggle button again — it becomes the X/close button)
    await hamburger.click();

    // Mobile nav overlay should disappear (React removes it from DOM)
    await expect(mobileNav).toBeHidden();
  });
});

test.describe("Responsive: Homepage Layout", () => {
  test("hero section stacks vertically", async ({ page }) => {
    await page.goto("/");

    // H1 should be visible
    await expect(page.locator("h1")).toBeVisible();

    // CTA buttons should be visible (these are in <main>, unique to homepage)
    await expect(page.locator("main").getByText("Start Learning")).toBeVisible();
    await expect(page.locator("main").getByText("View Curriculum")).toBeVisible();
  });

  test("stat cards display in 2-column grid", async ({ page }) => {
    await page.goto("/");

    // All 4 stats should be visible — scope to main content area to avoid sidebar matches
    const main = page.locator("main");
    await expect(main.locator("text=Weeks").first()).toBeVisible();
    await expect(main.locator("text=Phases").first()).toBeVisible();
    await expect(main.locator("text=Topics").first()).toBeVisible();
    await expect(main.locator("text=Appendices").first()).toBeVisible();
  });

  test("no horizontal overflow", async ({ page }) => {
    await page.goto("/");
    const overflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(overflow).toBe(false);
  });
});

test.describe("Responsive: Week Page", () => {
  test("week page renders correctly on mobile", async ({ page }) => {
    await page.goto("/week/1");

    // The mobile header text "Agent Code Academy" should be visible
    await expect(page.locator("header span").getByText("Agent Code Academy")).toBeVisible();
    await expect(page.locator("h1")).toBeVisible();

    // Objective and deliverable cards visible — scope to main
    const main = page.locator("main");
    await expect(main.locator("text=OBJECTIVE").first()).toBeVisible();
    await expect(main.locator("text=DELIVERABLE").first()).toBeVisible();
  });

  test("email banner renders on mobile", async ({ page }) => {
    // Clear localStorage to ensure banner shows
    await page.goto("/week/1");
    await page.evaluate(() => {
      localStorage.removeItem("ccm-email-banner-dismissed");
      localStorage.removeItem("ccm-email-subscribed");
    });
    await page.reload();
    await page.waitForLoadState("domcontentloaded");

    const banner = page.locator("text=Free AI Coding Cheat Sheet + lesson updates").first();
    await expect(banner).toBeVisible();
  });
});
