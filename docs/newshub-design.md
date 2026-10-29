# NewsHub: portfolio redesign

Date: 2026-10-29

## Intent and approval

Turn the existing student news aggregator into a polished portfolio project demonstrating visual judgment, reliable data handling, accessibility, and maintainable Next.js code. The user approved the editorial newsroom direction described in chat. This document expands that direction into concrete proposed defaults; it does not claim the application has been changed or tested.

## Approaches

- Editorial newsroom (selected): a lead story, supporting headlines, compact rows, expressive headline typography, and restrained color. Best fit for demonstrating design hierarchy within the current feature set.
- Personal reading workspace: efficient but needs deeper personalization to justify its navigation and layout.
- Visual magazine: attractive but too dependent on consistently good provider photography.

## Scope

Retain headlines, category pages, search, local bookmarks, light/dark themes, and outbound publisher links. Add country/language configuration through a shared server configuration, with the existing US/English defaults. Do not add accounts, AI summaries, email delivery, custom RSS ingestion, a database, or a paid provider integration in this release. Keep Next.js and Tailwind. Do not upgrade major framework versions as part of the redesign unless baseline verification establishes that it is necessary; track dependency maintenance separately.

Pagination is deliberately removed from this release. Show the articles actually returned, with a neutral end-of-list message; do not imply that these are all available articles. Verify the current provider contract and account capabilities before changing its parameters. Provider licensing and deployment eligibility must be checked before public launch.

## Visual direction — proposed defaults

- Palette: paper #F7F5F0, surface #FFFFFF, ink #172521, muted #5C6862, accent #1E6049, line #D9DED7. Dark mode: background #111A17, surface #19251F, text #F0F2EC, muted #AAB8AE, accent #98D5B4, line #34463B. Verify contrast in context before finalizing.
- Fonts: Newsreader for editorial headlines and Inter for navigation/body; use next/font with local/system fallbacks. Avoid an additional font dependency beyond loading these families.
- Layout: maximum width 1200px, gutters 20px mobile / 32px desktop. Spacing scale 4, 8, 12, 16, 24, 32, 48, 64px. Thin rules, modest 8px corner radii, minimal shadows, no decorative gradients or emoji section headings.
- Headline sizes: lead 32px mobile / 48px desktop; page titles 30px / 40px; supporting titles 22px / 26px; row titles 20px / 22px. Body minimum 16px; metadata minimum 12px.
- Motion: short color/opacity transitions, no hover zoom or layout motion required; honor reduced-motion preferences.

## Pages and interaction

### Shared shell

Text masthead “NewsHub”, concise description, date, search access, saved count, and an accessible theme control. Category strip below masthead; selected state uses text weight and an underline, not color alone. Country/language appear as a factual edition label, not an interactive selector in this release. Mobile navigation remains keyboard accessible and collapses without horizontal page overflow. Footer credits the actual provider.

### Homepage

Desktop: lead story occupies roughly two-thirds of the feature area; the remaining third contains up to three supporting headlines. Remaining stories appear as compact rows with small thumbnails. Render each article once. Mobile: lead story followed by supporting stories and rows in reading order. If fewer than four articles exist, render only available slots; never fabricate stories or use placeholders as real content.

Lead card: image, publisher/time, clickable headline, description, and bookmark control. Supporting stories prioritize headline and publisher over imagery. Use a neutral local placeholder for missing or failed images; a generic photo must not imply it depicts the story. Publisher links open with safe external-link attributes and communicate opening a new tab.

### Category pages

Category heading and short description above the shared feed, using a smaller feature area than the homepage. Unknown slugs show a proper not-found response. Preserve selected category navigation and page-specific metadata.

### Search

Labeled input and explicit submit behavior. Query lives in the URL; back/forward navigation updates both input and results. Show “N articles shown” rather than claiming a complete result count. Separate idle, loading, results, empty, and error states. Clear resets the URL and results. Cancel superseded requests and ignore stale responses even if cancellation is too late. Suggestions remain optional static shortcuts, not presented as trending topics.

### Saved articles

Compact reading list, saved count, individual remove actions, and an empty state linking to headlines. Keep browser-local storage and explain that saved articles remain on this device. Undo the most recent removal during the current page session. Clear-all requires a confirmation because it removes the entire list. Validate stored data; invalid entries are skipped and storage failures surface a non-blocking notice. Do not overwrite valid saved data before hydration finishes.

### Common states and accessibility

Skeletons follow the final layout and do not shift content excessively. Failed refreshes retain usable prior content with a retry notice. API quota errors explain temporary unavailability. Every control has an accessible name, visible focus, and a minimum 44px touch target. Bookmark controls expose aria-pressed. Use semantic headings and time elements, a skip link, polite announcements for result/bookmark changes, and adequate contrast in both themes. The shell renders before theme hydration rather than returning null for the whole application.

## Engineering boundaries

Create one server-only provider adapter and one normalized Article contract. Browser code never receives the API credential. API routes validate and bound inputs, normalize errors, and apply explicit caching and rate limits. Suggested cache TTL: 10 minutes for headlines, 5 minutes for search. Preserve an upstream publication timestamp and label cached response freshness accurately. Deployment cache/rate-limit storage must work across instances; a process-local map is insufficient for a public deployment. Keep cache keys separated by category, country, language, and query.

Introduce types only for the touched data path and redesigned components; avoid a blanket rewrite. Shared feed components own presentation; routes own parameter selection; server adapter owns provider details. Remove abandoned infinite-scroll state and unused imports. Limit remote image handling to a deliberately reviewed policy; disable SVG support unless a documented requirement exists.

## Evidence and completion

Baseline and final production build, lint, regression tests, mobile/desktop screenshots in both themes, keyboard checks, and a recorded performance/accessibility audit. Tests use fixtures, not the live API. Public demo must use a real configured provider or clearly labeled demo fixtures, never silently substitute sample news.

Portfolio case study: original problems, constraints, architecture, visual decisions, before/after screens, verified measurements, remaining limits, and personal contribution. Never invent performance gains or claim WCAG conformance from an automated score alone.

## Builder discretion

Choose the test libraries, deployment-compatible cache/rate-limit service, exact image policy, and minor typography adjustments after inspecting the full repository and deployment environment. No paid service purchase is authorized. If a deployment service is unavailable, finish the UI against deterministic fixtures and document the launch blocker. Read repository instructions before editing. This workspace currently contains planning output only, not a cloned repository.
