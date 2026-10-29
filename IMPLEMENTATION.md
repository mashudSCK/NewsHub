# Execution ledger

Base: dab14be0d3ae7503875a5c23b2ec67125f876398. Branch: feat/editorial-redesign.

Ruling: Use the fresh dedicated clone as isolation rather than create another worktree — no existing user checkout is being edited — no impact to the user's other branches.

Ruling: Keep paid services and provider credentials external; implement shared Redis REST storage with a fail-closed live-production configuration and a clearly labeled demo mode — no credentials or service account were supplied — live deployment requires configuration.

Ruling: Use direct browser images with an HTTPS-only validated URL and no server image proxy — arbitrary publishers make a fixed optimizer allowlist impractical — image performance depends on publishers, while private-network optimization risk is removed.

Plan and design: copied to docs/ for the implementation handoff. Check entries below for actual verification; do not interpret planned targets as measured results.
Ruling: Upgrade Next.js and React to patched current releases after the locked Next.js 14 audit reported critical advisories — necessary for a publishable portfolio — costs a compatibility migration, verified by build and regression tests.
Final review: fresh reviewer on inherited model; highest-capability review was unavailable due to its usage limit. Two important issues reproduced by failing tests: hidden storage failures and truncation of 501 valid bookmarks. Fixes preserve all valid saved data and show session-only failures globally. Minor deferred: failed image URL state remains sticky if an article later supplies a new image URL.
Ruling: Render the initial headlines through the shared server handler and hydrate that edition without a duplicate request — Lighthouse identified late lead-image discovery — server requests use the same cache, quotas, validation and errors; live rendering waits within the existing provider timeout.
Final: fixed hidden persistence failures — provider-level storage notice and session-only announcement tests RED to GREEN; fixed 501-entry truncation — legacy persistence test RED to GREEN; final suite 24/24. Expanded browser suite 6/6, including mobile/desktop axe checks, is green. Production build, lint, types and audit are verified. See docs/verification.md for actual metrics and external prerequisites.
