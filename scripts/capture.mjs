import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
const browser = await chromium.launch({
  channel: process.env.CI ? undefined : "msedge",
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await mkdir("docs/evidence", { recursive: true });
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
for (const theme of ["light", "dark"]) {
  await page.addInitScript(
    (value) => localStorage.setItem("newsTheme", value),
    theme,
  );
  for (const [name, route] of [
    ["home", "/"],
    ["search", "/search?q=climate"],
    ["saved", "/bookmarks"],
  ]) {
    await page.goto(`http://127.0.0.1:3001${route}`);
    await page.waitForLoadState("networkidle");
    await page.evaluate(() => document.fonts.ready);
    if (name === "home") await page.locator("article").first().waitFor();
    if (name === "saved" && theme === "light") {
      await page.goto("http://127.0.0.1:3001/");
      await page
        .getByRole("button", { name: /^Save article:/ })
        .first()
        .click();
      await page.goto("http://127.0.0.1:3001/bookmarks");
      await page.waitForLoadState("networkidle");
    }
    for (const [size, width, height] of [
      ["desktop", 1440, 1000],
      ["mobile", 390, 844],
    ]) {
      await page.setViewportSize({ width, height });
      await page.screenshot({
        path: `docs/evidence/${name}-${theme}-${size}.png`,
        fullPage: true,
      });
    }
  }
}
await writeFile(
  "docs/evidence/browser-errors.json",
  JSON.stringify(errors, null, 2),
);
console.log(
  `Captured 12 screens; ${errors.length} browser errors; ${browser.version()}`,
);
await browser.close();
