# Provider contract and launch checklist

Verified against primary documentation on 2026-10-29:

- [Top headlines](https://docs.gnews.io/endpoints/top-headlines-endpoint): `apikey`, `category`, `lang`, `country`, `max`.
- [Search](https://docs.gnews.io/endpoints/search-endpoint): `q` up to 200 characters, `apikey`, `lang`, `country`, `max`, `sortby`.
- [Plans and eligibility](https://gnews.io/pricing): free plan currently lists 100 requests/day, 10 articles per response, a 12-hour delay, and non-commercial use. Account rights must be verified before public deployment. No account was supplied during implementation.

Both endpoint documents now describe `page`. This implementation intentionally remains a bounded edition of up to 10 stories; removing pagination is a product scope decision, not a claim that the API can never paginate. The previous app accepted page numbers without transmitting them.

## Runtime contract

No browser credential. Live mode requires `GNEWS_API_KEY`. Live production also requires a Redis REST URL and token; it fails closed if they are absent. Demo mode never contacts GNews and is labeled on every page. Demo text is original illustrative copy. Publisher/resource links identify related resources, not attribution for fabricated reporting. Images are illustrative Unsplash photographs.

Headlines are cached for 600 seconds; search for 300. Cache keys include endpoint, edition, category, and query. Responses preserve `fetchedAt`; this is retrieval time, not publication time. Failed requests are not cached. Redis counters are atomic. Per-client ceiling is 30 requests/60 seconds; daily upstream budget defaults to 90, resetting at UTC midnight. Cache hits do not consume upstream budget. Concurrent misses can consume multiple upstream requests but cannot exceed the shared budget. Redis availability is required for live production requests.

Client identity is deliberately conservative. By default all requests share one client bucket. On Vercel only, set `NEWS_TRUST_VERCEL=true` to trust the platform-maintained `x-vercel-forwarded-for` header; do not enable this on a proxy that forwards caller-supplied values. Identities are hashed before use as keys and expire with the rate window. Configure a different trusted identity boundary before using another host at scale.

Remote images are requested directly by the browser over HTTPS with no-referrer; no open server optimizer/proxy is provided. Literal private/local destinations and unsafe schemes are rejected. Browser and publisher policies still govern remote requests and availability. A placeholder replaces failed images; article text remains usable.

## Before public live launch

- Confirm provider plan rights, quota and attribution for the actual deployment.
- Configure credential, edition and Redis environment variables through the host's secret settings.
- Set a daily budget below the actual account allowance; do not share that allowance unknowingly with other apps.
- Verify the platform's trusted client-IP header behavior before enabling individual buckets.
- Smoke-test GNews and Redis on the host; unit tests use simulated external boundaries, not those live services.
- Verify production caching, 429 recovery, request timeouts, and logs contain no tokens.

No services were purchased or provisioned, and no deployment or remote push was performed during implementation.
