import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("reads, saves, persists, removes, undoes and clears with keyboard", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Top stories", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: /^Save article:/ })
    .first()
    .click();
  await page.getByRole("link", { name: /Saved 1/ }).click();
  await expect(page.getByRole("article")).toHaveCount(1);
  await page.reload();
  await expect(page.getByRole("article")).toHaveCount(1);
  await page.getByRole("button", { name: /^Remove saved article:/ }).click();
  await expect(page.getByRole("article")).toHaveCount(0);
  await page.getByRole("button", { name: "Undo removal" }).click();
  await expect(page.getByRole("article")).toHaveCount(1);
  await page.getByRole("button", { name: "Clear list" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(page.getByRole("button", { name: "Clear list" })).toBeFocused();
  await page.getByRole("button", { name: "Clear list" }).click();
  await page.getByRole("button", { name: "Clear all stories" }).click();
  await expect(page.getByRole("article")).toHaveCount(0);
});
test("search URL, loading, clear, empty and history stay consistent", async ({
  page,
}) => {
  await page.goto("/search");
  const input = page.getByRole("textbox", { name: "Search news" });
  await input.fill("climate");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await expect(page).toHaveURL(/q=climate/);
  await expect(page.getByRole("article")).toHaveCount(2);
  await input.fill("zzzznothing");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "No stories found" }),
  ).toBeVisible();
  await page.goBack();
  await expect(input).toHaveValue("climate");
  await expect(page.getByRole("article")).toHaveCount(2);
  await page.getByRole("button", { name: "Clear search" }).click();
  await expect(input).toHaveValue("");
  await expect(page).toHaveURL(/\/search$/);
});
test("handles API failure and retry", async ({ page }) => {
  await page.route("**/api/headlines*", (route) =>
    route.fulfill({
      status: 429,
      json: {
        error: { code: "RATE_LIMITED", message: "Please try again later." },
      },
    }),
  );
  await page.goto("/");
  await page.getByRole("button", { name: "Refresh stories" }).click();
  await expect(
    page.getByRole("alert").filter({ hasText: "Please try again later" }),
  ).toBeVisible();
  await page.unroute("**/api/headlines*");
  await page.getByRole("button", { name: "Try again", exact: true }).click();
  await expect(page.getByRole("article")).toHaveCount(10);
});
test("serves invalid category as 404 and keeps shell without JavaScript", async ({
  browser,
  page,
}) => {
  const response = await page.goto("/category/no-such-category");
  expect(response?.status()).toBe(404);
  const context = await browser.newContext({ javaScriptEnabled: false });
  const nojs = await context.newPage();
  await nojs.goto("http://127.0.0.1:3001/");
  await expect(nojs.getByRole("link", { name: "NewsHub home" })).toBeVisible();
  await expect(nojs.getByRole("article")).toHaveCount(10);
  await nojs.goto("http://127.0.0.1:3001/bookmarks");
  await expect(nojs.getByRole("link", { name: "Find a story" })).toBeVisible();
  await context.close();
});
for (const theme of ["light", "dark"]) {
  test(`${theme} theme: accessible pages and narrow layouts`, async ({
    page,
  }) => {
    await page.addInitScript(
      (value) => localStorage.setItem("newsTheme", value),
      theme,
    );
    for (const route of [
      "/",
      "/search?q=climate",
      "/bookmarks",
      "/category/technology",
    ]) {
      await page.goto(route);
      await page.waitForLoadState("networkidle");
      for (const width of [390, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        const results = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa", "best-practice"])
          .analyze();
        expect(results.violations, `${theme} ${route} at ${width}px`).toEqual(
          [],
        );
      }
      for (const width of [320, 390, 768, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= window.innerWidth,
          ),
          `${theme} ${route} at ${width}px`,
        ).toBe(true);
      }
    }
    await page.goto("/");
    await page.keyboard.press("Tab");
    await expect(
      page.getByRole("link", { name: "Skip to content" }),
    ).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.locator("main")).toBeFocused();
  });
}
