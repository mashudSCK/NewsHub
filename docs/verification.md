# NewsHub verification report

Verified on 2026-10-29 against the local production build.

## Environment

- Node 24.22.1; Next.js 16.4.3; React 19.3.1.
- Windows; headless Microsoft Edge 156.0.4314.50.
- Demo fixtures, no GNews credential, no live Redis service.
- Source base: dab14be0d3ae7503875a5c23b2ec67125f876398; branch: feat/editorial-redesign.

## Gates

| Check                                     | Result                                                |
| ----------------------------------------- | ----------------------------------------------------- |
| Production build (`next build --webpack`) | Pass                                                  |
| ESLint                                    | Pass, no warnings/errors                              |
| TypeScript (`tsc --noEmit`)               | Pass                                                  |
| Vitest regression suite                   | 24 tests pass across 6 files                          |
| Playwright browser suite                  | 6 tests pass                                          |
| Dependency audit                          | 0 vulnerabilities, including development dependencies |
| Lockfile                                  | npm ci dry-run passes on supported Node runtime       |
| Captured pages                            | 12 final screenshots; 0 browser errors during capture |

The original baseline lint had unescaped-entity errors and hook warnings. Its build attempted to fetch Google Fonts and failed under restricted network access. The redesigned build bundles the fonts locally. Baseline screenshots exist, but a comparable pre-redesign performance benchmark was not collected; no performance-gain claim is made.

## Browser coverage

Save, reload, remove, undo, cancel/confirm clear-all; URL search, empty results, clear, back navigation; API failure and retry; invalid category 404; visible shell and initial articles with JavaScript disabled; useful saved-page instructions before hydration; skip link and keyboard focus.

Automated axe checks cover home, search, saved, and a category page at 390px and 1440px in light and dark themes, with WCAG 2 A/AA, 2.1 AA, and best-practice rule tags. Overflow checks cover 320px, 390px, 768px, and 1440px. Mobile and desktop rendered screens were inspected manually. These checks are not a WCAG certification or a complete assistive-technology audit.

## Mobile Lighthouse

Three runs per page; medians below. Lighthouse 13.6.0, 390×844 viewport, default simulated mobile throttling, local production server, external Unsplash images, empty saved list. Raw first-run reports and all per-run summary values are included in evidence/.

| Page   | Performance | Accessibility |     LCP |     CLS |
| ------ | ----------: | ------------: | ------: | ------: |
| Home   |          87 |           100 | 3.049 s | 0.00092 |
| Search |          93 |           100 | 0.779 s | 0.00077 |
| Saved  |          93 |           100 | 0.863 s | 0.00169 |

The home page misses the proposed performance target of 90. Its lead image is now discoverable in server HTML and uses eager/high-priority loading; the report still shows about 3 seconds simulated LCP and 320ms total blocking time in its first recorded run. Publisher-image latency and client hydration remain optimization opportunities. Results vary with machine load, external imagery, browser version, and hosting. Search and saved pages met the target. All three met the proposed accessibility score target.

The saved-page audit was repeated after a targeted first-render improvement; home/search results were retained because those pages did not change. See [performance-summary.json](evidence/performance-summary.json).

## Review fixes

A fresh reviewer found two important issues. Tests reproduced both before fixes:

- Storage write failures were hidden outside the saved page. The provider now displays a global nonblocking warning and announces session-only updates.
- A shared normalizer silently truncated 501 valid saved entries to 500. Provider bounds remain at 10, while bookmark restoration preserves all valid entries. A 501-entry regression test checks persistence after a mutation.

The full suite passes after the fixes. One minor issue remains: after an image fails, a replacement URL for the same mounted article can retain the fallback until a page reload. The normal missing-image case works.

## Remaining external prerequisites

GNews and Redis integration boundaries are covered with simulated responses and store contracts. Actual account entitlements, hosted credentials, shared-service availability, and deployed header behavior could not be verified without supplied accounts. Live production fails closed without its required configuration. No services were purchased, no remote branch was pushed, and no site was deployed.

The GitHub Actions workflow is included and has not been executed on GitHub from this local session. Its constituent verification commands were run locally.

## Implementation choices

A dedicated clone provides isolation. Next.js/React were upgraded because the baseline audit reported critical advisories. Headlines now render through the same server handler used by API routes, avoiding a duplicate hydration request. Remote images load directly in the browser rather than through an unrestricted server proxy. Live production uses shared Redis; demo mode is explicit. These choices and their tradeoffs are recorded in IMPLEMENTATION.md.
