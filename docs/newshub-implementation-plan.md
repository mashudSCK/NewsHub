# NewsHub Editorial Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Use subagent-driven-development only if selected for execution.

**Goal:** Deliver a portfolio-quality editorial news reader with dependable search, saved articles, and documented engineering decisions.

**Architecture:** Preserve Next.js App Router and Tailwind. Normalize provider data behind server-only code and thin API routes, reuse feed presentation across pages, and keep client state limited to search interactions, bookmarks, and theme controls.

**Tech Stack:** Existing Next.js/React/Tailwind/Lucide stack; incremental TypeScript; proposed Vitest with React Testing Library for regressions and Playwright for browser flows. Confirm compatibility during baseline setup.

**Spec:** [newshub-design.md](newshub-design.md)

## Global Constraints

- Keep Next.js and Tailwind.
- Do not add accounts, AI summaries, email delivery, custom RSS ingestion, a database, or a paid provider integration in this release.
- Pagination is deliberately removed from this release.
- Browser code never receives the API credential.
- Tests use fixtures, not the live API.
- No paid service purchase is authorized.
- Read repository instructions before editing.
- This is a planning deliverable; repository code has not been changed or executed.

## Review Focus

- Out-of-order search responses must never replace results for the current query (Task 3).
- Empty, truncated, or malformed upstream responses must render bounded truthful content (Tasks 2 and 4).
- Corrupt or unavailable browser storage must not crash the app or silently destroy valid bookmarks (Task 5).
- Theme initialization must preserve visible shell content and readable controls (Task 4).
- Narrow screens, long headlines, missing images, and keyboard-only use must remain usable in both themes (Tasks 4 and 6).

## Proposed file ownership

Confirm existing paths after checkout; these paths are based on files read from the default branch.

| Files | Responsibility |
|---|---|
| `lib/news/types.ts`, `config.ts`, `provider.ts` | Article contract, validated configuration, server-only provider adapter |
| `lib/news/cache.ts`, `rate-limit.ts` | Explicit deployment-compatible cache and request-budget boundaries |
| `app/api/headlines/route.js`, `app/api/search/route.js` | Input validation and stable HTTP responses |
| `utils/fetchNews.js`, `hooks/useNewsFeed.ts` | Browser API calls, request cancellation, feed state |
| `utils/formatDate.ts`, `lib/news/categories.ts` | Date formatting and shared category values |
| `components/news/NewsFeed.tsx`, `LeadStory.tsx`, `ArticleRow.tsx`, `FeedState.tsx` | Shared editorial presentation |
| `components/Navbar.jsx`, `CategoryTabs.jsx`, `SearchBar.jsx`, `NewsCard.jsx` | Existing entry points adapted to the design; remove obsolete components only after checking references |
| `app/page.js`, `app/category/[category]/page.js`, `app/search/page.js`, `app/bookmarks/page.js` | Route-specific composition |
| `context/ThemeContext.js`, `context/BookmarkContext.js` | Theme initialization and resilient local persistence |
| `app/layout.js`, `app/globals.css`, `tailwind.config.js`, `next.config.js` | Shell, tokens, typography, metadata, image policy |

## Task 1: Reproduce and record the baseline

**Files:** `package.json`, existing lockfile, test configuration, `tests/fixtures/news.ts`, project documentation.

**Interfaces:** Produce deterministic success, empty, malformed, and quota-error fixtures matching the existing routes. Preserve current dependency versions until a specific incompatibility is demonstrated.

- [ ] Clone the repository into `work/NewsHub`, read applicable AGENTS.md instructions, record the default-branch commit and working-tree state. Establish isolation according to the repository workflow.
- [ ] Use the repository lockfile to install dependencies; record Node/package-manager versions. Run existing build and lint scripts and distinguish pre-existing failures.
- [ ] Capture original homepage, search, and saved-list screenshots at 390px and 1440px width. Use explicitly labeled fixtures if credentials are unavailable.
- [ ] Add the smallest compatible test setup. Prove one fixture-based route test and one browser smoke test run without a provider credential.
- [ ] Record baseline audit results with browser version, viewport, data source, and measurement conditions. Commit the reproducible baseline/test harness.

## Task 2: Establish the provider contract and request budget

**Files:** `lib/news/{types,config,provider,cache,rate-limit,categories}.ts`, API routes, environment template, `tests/news/provider.test.ts`, `tests/news/routes.test.ts`.

**Interfaces:** `Article = { id: string; url: string; title: string; description: string | null; image: string | null; source: { name: string; url: string | null }; publishedAt: string | null }`. `NewsResult = { articles: Article[]; fetchedAt: string }`. `getHeadlines({ category, country, language }): Promise<NewsResult>` and `searchArticles({ query, language }): Promise<NewsResult>`. Route errors use `{ error: { code, message } }`; codes: `INVALID_INPUT`, `UPSTREAM_UNAVAILABLE`, `RATE_LIMITED`, `CONFIGURATION_ERROR`.

- [ ] Verify current GNews parameters, result limits, attribution, and public deployment eligibility using primary documentation and the actual account plan. Record these as implementation constraints; do not repeat unverified README limits.
- [ ] Write failing tests for normalization: filter entries without valid HTTP(S) URL/title; deduplicate by normalized URL; invalid dates and images become null; null article arrays become empty lists.
- [ ] Write failing route tests: trim search queries, reject blank or over-200-character queries with 400, reject unknown categories/countries/languages, and prevent unbounded caller-controlled result limits. Use the configured US/English edition; cap upstream results at the verified supported limit.
- [ ] Write failure tests for absent credentials, upstream 429, non-JSON errors, and a 10-second timeout. Browser-facing messages must exclude credential/upstream URL details.
- [ ] Implement the server-only adapter using `GNEWS_API_KEY`, the Article contract, explicit error mapping, and validated configuration. Keep provider response details out of presentation code.
- [ ] Implement headline caching for 600 seconds and search caching for 300 seconds. Test that identical keys reuse results, edition/query changes do not collide, and expired entries refresh. Do not cache failures.
- [ ] Add a deployment-compatible shared limiter before provider access: proposed per-client ceiling 30 requests/minute plus a configurable global upstream budget matched to the verified account quota. Test 429/Retry-After and ensure cache hits do not consume upstream budget. Document trusted proxy/client identification rules.
- [ ] Run targeted provider/route tests, lint, and production build; commit only when passing. If no shared backing service is available, expose the dependency explicitly and retain fixture mode for development; do not claim public-launch readiness.

## Task 3: Make feed and search behavior predictable

**Files:** `utils/fetchNews.js`, `hooks/useNewsFeed.ts`, `utils/formatDate.ts`, home/category/search pages, `components/SearchBar.jsx`, obsolete infinite-scroll hook, `tests/news/feed.test.tsx`, `tests/news/search.test.tsx`.

**Interfaces:** Browser helpers return `NewsResult` and accept `AbortSignal`. `useNewsFeed({ category?, query?, country, language }): { articles, status, error, retry, fetchedAt }`; status is `idle | loading | success | empty | error`. Preserve prior successful data during refresh failure. Article consumers use only the normalized contract.

- [ ] Write failing tests where query A resolves after query B: only B may render. Assert loading appears during nonempty search and a failed refresh retains prior articles with a retry notice.
- [ ] Test clear, whitespace, and back/forward navigation: URL, input, and results agree. Clearing returns search to idle. Invalid category slugs return not-found rather than a general feed.
- [ ] Implement request cancellation plus a request-identity guard, remove all page/load-more state and infinite-scroll wiring, and centralize feed status handling.
- [ ] Implement safe date labels for null/invalid/future timestamps; include a semantic absolute date where valid. Split shared category constants from networking utilities.
- [ ] Run targeted tests, lint, and production build; commit the behavior fixes before changing the layout.

## Task 4: Build the editorial interface

**Files:** Shared news components, `Navbar.jsx`, `CategoryTabs.jsx`, `NewsCard.jsx`, `SearchBar.jsx`, `app/layout.js`, `app/globals.css`, `tailwind.config.js`, theme context, home/category/search pages, local image placeholder, `tests/e2e/editorial.spec.ts`.

**Interfaces:** `NewsFeed({ articles: Article[], variant: 'home' | 'category' | 'search' })`; `LeadStory({ article })`; `ArticleRow({ article })`. Bookmark controls consume existing context via the normalized Article shape. Home slicing: first article lead, next up to three supporting stories, remaining articles rows. Category uses the same composition with a reduced lead heading; search uses compact rows.

- [ ] Apply spec palette, type scale, spacing, width, and font families as shared tokens. Build masthead, edition/date label, navigation, footer attribution, and skip link.
- [ ] Build lead/supporting/row components and layout-matched skeletons. With 0, 1, 3, and 10 fixture articles, assert each article is rendered at most once and no empty feature slots remain.
- [ ] Compose home/category/search layouts and all states. Headlines are links; images use neutral local fallbacks; dates and source labels retain prominence. Use “N articles shown” and avoid claims of exhaustive coverage.
- [ ] Replace mount-gated whole-app rendering with theme initialization that preserves shell HTML. Support saved preference and system preference when none is saved; guard storage access.
- [ ] Verify both themes at 390px, 768px, and 1440px; also inspect 320px and 200% zoom. Test long headlines/source names, broken images, and no-image articles. No page-level horizontal overflow or clipped controls.
- [ ] Check visible focus, semantic headings, 44px targets, input/control names, aria-pressed bookmarks, reduced motion, and new-tab disclosure. Browser tests verify shell content before hydration and usable keyboard navigation.
- [ ] Run lint/build and browser tests; inspect screenshots manually and commit the redesign.

## Task 5: Finish the reading list

**Files:** `context/BookmarkContext.js`, `app/bookmarks/page.js`, shared bookmark control/feedback components, `tests/news/bookmarks.test.tsx`, `tests/e2e/bookmarks.spec.ts`.

**Interfaces:** Preserve `newsBookmarks` as the storage key and read legacy GNews/NewsAPI-shaped entries through the normalizer. Context exposes normalized bookmarks, `isLoaded`, a nonblocking storage error, `addBookmark`, `removeBookmark`, `clearAllBookmarks`, and session-only `undoLastRemoval`.

- [ ] Write failing tests for duplicate URLs, reload persistence, malformed JSON, non-array data, invalid entries, unavailable storage, and storage write failures. Assert valid existing data is not overwritten during initial loading.
- [ ] Implement guarded loading, legacy normalization, stable URL identity, and nonblocking storage notices. Do not imply data was saved if persistence failed.
- [ ] Build compact saved rows, clear empty state, saved count, device-local explanation, remove feedback with undo, and clear-all confirmation. Confirmation must support keyboard focus, Escape, and focus return.
- [ ] Verify save from home, find in saved list, reload, remove, undo, and cancel/confirm clear-all. Run tests, lint/build, and commit.

## Task 6: Prove and present the result

**Files:** `next.config.js`, workflow under `.github/workflows/`, README, environment example, case-study source, screenshots/audit artifacts.

**Interfaces:** CI runs the verified repository install, lint, unit/integration tests, production build, and fixture-based browser tests. Deployment consumes the server credential and chosen shared cache/limiter configuration.

- [ ] Review image optimization policy against actual publisher domains and deployment needs. Disable SVG unless required; reject unsafe URL schemes, local/private destinations, and redirects to those destinations. Add focused regression checks if using an image proxy. Avoid merely preserving the current unrestricted wildcard configuration.
- [ ] Run the full gate: `npm run lint`, `npm run test -- --run`, `npm run build`, and `npm run test:e2e` after defining these scripts in Task 1. Confirm all pass; CI must use the same commands and no live-provider credential.
- [ ] Perform keyboard-only journeys and automated accessibility checks on each page/state in both themes. Manually inspect contrast and reading/focus order. Resolve serious/critical findings and document remaining limitations.
- [ ] Repeat baseline performance measurements under the same conditions. Target mobile Lighthouse performance >=90 and accessibility >=95 on fixture-based home/search/saved pages; report the median of three runs. If missed, record the bottleneck and actual score rather than claim success. Targets do not replace functional or manual accessibility checks.
- [ ] Capture final screenshots matching the baseline and document provider/deployment checks. Deploy only when launch prerequisites and credentials are satisfied; use clearly labeled fixtures for any demo mode.
- [ ] Replace inaccurate README claims and machine-specific setup instructions. Write a short case study with problem, constraints, architecture, design rationale, before/after images, measured results, personal contribution, and remaining limitations. Commit documentation and verified evidence.

## Suggested milestones and stop condition

1. Reliable data and search: Tasks 1–3.
2. Portfolio interface and saved list: Tasks 4–5.
3. Verified release and case study: Task 6.

Stop once the scoped reader passes the gates and the case study accurately reflects the shipped work. Additional features need a separate decision. No implementation, dependency installation, repository mutation, or deployment has been performed by creating this plan.
