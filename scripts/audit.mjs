import { chromium } from "@playwright/test";
import lighthouse from "lighthouse";
import { mkdir, writeFile, readFile } from "node:fs/promises";
const browser = await chromium.launch({
  channel: process.env.CI ? undefined : "msedge",
  args: ["--remote-debugging-port=9222"],
});
await mkdir("docs/evidence", { recursive: true });
const results = [];
const onlyPage = process.argv[2];
if (onlyPage) {
  try {
    const previous = JSON.parse(
      await readFile("docs/evidence/performance-summary.json", "utf8"),
    );
    results.push(
      ...previous.results.filter((result) => result.page !== onlyPage),
    );
  } catch {}
}
try {
  for (const [name, path] of [
    ["home", "/"],
    ["search", "/search?q=climate"],
    ["saved", "/bookmarks"],
  ]) {
    if (onlyPage && name !== onlyPage) continue;
    const runs = [];
    for (let i = 0; i < 3; i++) {
      const result = await lighthouse(`http://127.0.0.1:3001${path}`, {
        port: 9222,
        logLevel: "error",
        output: "json",
        onlyCategories: ["performance", "accessibility"],
        formFactor: "mobile",
        screenEmulation: {
          mobile: true,
          width: 390,
          height: 844,
          deviceScaleFactor: 1,
          disabled: false,
        },
      });
      const { lhr } = result;
      const run = {
        performance: Math.round(lhr.categories.performance.score * 100),
        accessibility: Math.round(lhr.categories.accessibility.score * 100),
        lcp: Math.round(lhr.audits["largest-contentful-paint"].numericValue),
        cls: lhr.audits["cumulative-layout-shift"].numericValue,
      };
      runs.push(run);
      console.log(name, i + 1, JSON.stringify(run));
      if (i === 0)
        await writeFile(`docs/evidence/lighthouse-${name}.json`, result.report);
    }
    const median = (key) => runs.map((r) => r[key]).sort((a, b) => a - b)[1];
    results.push({
      page: name,
      runs,
      median: {
        performance: median("performance"),
        accessibility: median("accessibility"),
        lcp: median("lcp"),
        cls: median("cls"),
      },
    });
  }
  await writeFile(
    "docs/evidence/performance-summary.json",
    JSON.stringify(
      {
        browser: browser.version(),
        lighthouseVersion: "13.6.0",
        viewport: "390x844",
        mode: "local production / demo fixtures, external Unsplash images",
        throttling: "Lighthouse default simulated mobile",
        results,
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
