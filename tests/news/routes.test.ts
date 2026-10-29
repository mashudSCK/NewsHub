import { describe, it, expect, vi, afterEach } from "vitest";
import { handleNewsRequest } from "@/lib/news/handler";
import { createMemoryStore } from "@/lib/news/store";
const request = (q = "") => new Request(`http://localhost/api/search?${q}`);
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});
describe("news routes", () => {
  it("rejects blank/oversized queries, invalid editions, categories and result overrides", async () => {
    for (const q of [
      "q=",
      "q=%20",
      "q=" + "x".repeat(201),
      "q=hello&lang=xx",
      "q=hello&country=xx",
      "q=hello&max=1000",
    ]) {
      expect((await handleNewsRequest(request(q), "search")).status).toBe(400);
    }
    expect(
      (await handleNewsRequest(request("category=madeup"), "headlines")).status,
    ).toBe(400);
  });
  it("returns explicitly labeled, searchable demo data without credentials", async () => {
    vi.stubEnv("NEWS_MODE", "demo");
    const response = await handleNewsRequest(request("q=climate"), "search");
    const data = await response.json();
    expect(data.mode).toBe("demo");
    expect(data.articles.length).toBeGreaterThan(0);
    expect(
      data.articles.every((a: any) =>
        /climate/i.test(a.title + " " + a.description),
      ),
    ).toBe(true);
    const empty = await handleNewsRequest(request("q=zzzznothing"), "search");
    expect((await empty.json()).articles).toEqual([]);
  });
  it("does not silently fall back to fixtures when live credentials are absent", async () => {
    vi.stubEnv("NEWS_MODE", "live");
    vi.stubEnv("GNEWS_API_KEY", "");
    const response = await handleNewsRequest(request("q=hello"), "search");
    expect(response.status).toBe(503);
    expect((await response.json()).error.code).toBe("CONFIGURATION_ERROR");
  });
  it("uses provider parameters, caches results and separates queries", async () => {
    vi.stubEnv("NEWS_MODE", "live");
    vi.stubEnv("GNEWS_API_KEY", "secret");
    const fetcher = vi.fn<typeof fetch>(
      async () =>
        new Response(
          JSON.stringify({
            articles: [
              { title: "Real story", url: "https://example.com/news" },
            ],
          }),
          { status: 200 },
        ),
    );
    const deps = { store: createMemoryStore(), fetcher };
    const a = await handleNewsRequest(request("q=hello"), "search", deps);
    const b = await handleNewsRequest(request("q=hello"), "search", deps);
    expect((await a.json()).fetchedAt).toBe((await b.json()).fetchedAt);
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(
      new URL(String(fetcher.mock.calls[0][0])).searchParams.get("apikey"),
    ).toBe("secret");
    await handleNewsRequest(request("q=other"), "search", deps);
    expect(fetcher).toHaveBeenCalledTimes(2);
    await handleNewsRequest(request("category=technology"), "headlines", deps);
    expect(
      new URL(String(fetcher.mock.calls[2][0])).searchParams.get("category"),
    ).toBe("technology");
  });
  it("sanitizes quota, malformed-response and timeout errors", async () => {
    vi.stubEnv("NEWS_MODE", "live");
    vi.stubEnv("GNEWS_API_KEY", "secret");
    for (const [fetcher, status, code] of [
      [
        async () => new Response("secret", { status: 429 }),
        429,
        "RATE_LIMITED",
      ],
      [async () => new Response("not json"), 502, "UPSTREAM_UNAVAILABLE"],
      [
        async () => {
          throw new DOMException("secret", "TimeoutError");
        },
        502,
        "UPSTREAM_UNAVAILABLE",
      ],
    ] as const) {
      const response = await handleNewsRequest(request("q=hello"), "search", {
        store: createMemoryStore(),
        fetcher,
      });
      expect(response.status).toBe(status);
      const body = await response.text();
      expect(body).toContain(code);
      expect(body).not.toContain("secret");
    }
  });
  it("limits requests and preserves the upstream budget for cache hits", async () => {
    vi.stubEnv("NEWS_MODE", "live");
    vi.stubEnv("GNEWS_API_KEY", "secret");
    vi.stubEnv("NEWS_DAILY_BUDGET", "1");
    const fetcher = vi.fn(
      async () => new Response(JSON.stringify({ articles: [] })),
    );
    const deps = { store: createMemoryStore(), fetcher };
    expect(
      (await handleNewsRequest(request("q=a"), "search", deps)).status,
    ).toBe(200);
    expect(
      (await handleNewsRequest(request("q=a"), "search", deps)).status,
    ).toBe(200);
    const limited = await handleNewsRequest(request("q=b"), "search", deps);
    expect(limited.status).toBe(429);
    expect(limited.headers.get("Retry-After")).toBeTruthy();
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
});
