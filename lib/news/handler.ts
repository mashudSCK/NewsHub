import "server-only";
import { createHash } from "node:crypto";
import { NEWS_CATEGORIES } from "./categories";
import { getNewsConfig } from "./config";
import { demoArticles } from "./demo";
import { NewsError, fetchProvider } from "./provider";
import { getStore, type NewsStore } from "./store";
import type { NewsResult } from "./types";
export async function handleNewsRequest(
  request: Request,
  kind: "headlines" | "search",
  deps?: { store: NewsStore; fetcher?: typeof fetch },
): Promise<Response> {
  try {
    const config = getNewsConfig();
    const s = new URL(request.url).searchParams;
    const category = s.get("category") || "general",
      country = s.get("country") || config.country,
      language = s.get("lang") || config.language,
      query = (s.get("q") || "").trim();
    if (
      !NEWS_CATEGORIES.some((c) => c.id === category) ||
      !["us", "gb", "ph", "au", "ca", "in"].includes(country) ||
      !["en", "es", "fr", "de", "ja"].includes(language) ||
      s.has("max") ||
      s.has("page") ||
      (kind === "search" && (!query || query.length > 200))
    )
      throw new NewsError(
        "INVALID_INPUT",
        400,
        "Check the search or edition and try again.",
      );
    if (!["live", "demo"].includes(config.mode))
      throw new NewsError(
        "CONFIGURATION_ERROR",
        503,
        "News is not configured. Please try again later.",
      );
    if (config.mode === "demo")
      return Response.json(
        {
          articles: demoArticles(category, kind === "search" ? query : ""),
          fetchedAt: new Date().toISOString(),
          mode: "demo",
        },
        { headers: { "Cache-Control": "no-store" } },
      );
    if (!config.key)
      throw new NewsError(
        "CONFIGURATION_ERROR",
        503,
        "Live news is not configured. Please try again later.",
      );
    let store: NewsStore;
    try {
      store = deps?.store || getStore();
    } catch {
      throw new NewsError(
        "CONFIGURATION_ERROR",
        503,
        "Live news is not configured. Please try again later.",
      );
    }
    // Only trust the platform header when explicitly enabled on Vercel.
    const identity =
      process.env.NEWS_TRUST_VERCEL === "true" && process.env.VERCEL
        ? request.headers
            .get("x-vercel-forwarded-for")
            ?.split(",")[0]
            ?.trim() || "shared"
        : "shared";
    const hash = (s: string) => createHash("sha256").update(s).digest("hex");
    if (!(await store.take(`newshub:client:${hash(identity)}`, 30, 60)))
      throw new NewsError(
        "RATE_LIMITED",
        429,
        "Too many requests. Please wait a minute and try again.",
        60,
      );
    const key = `newshub:v1:${hash(JSON.stringify([kind, category, country, language, kind === "search" ? query : ""]))}`;
    const cached = await store.get<NewsResult>(key);
    if (cached)
      return Response.json(cached, {
        headers: { "Cache-Control": "no-store" },
      });
    const now = new Date();
    const seconds = Math.ceil(
      (Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1) -
        now.getTime()) /
        1000,
    );
    if (
      !(await store.take(
        `newshub:budget:${now.toISOString().slice(0, 10)}`,
        config.dailyBudget,
        seconds,
      ))
    )
      throw new NewsError(
        "RATE_LIMITED",
        429,
        "Today’s news request allowance has been reached. Please try again tomorrow.",
        seconds,
      );
    const result = await fetchProvider(
      kind,
      { category, country, language, query },
      config.key,
      deps?.fetcher,
    );
    await store.set(key, result, kind === "headlines" ? 600 : 300);
    return Response.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const e =
      error instanceof NewsError
        ? error
        : new NewsError(
            "UPSTREAM_UNAVAILABLE",
            503,
            "News is temporarily unavailable. Please try again.",
          );
    return Response.json(
      { error: { code: e.code, message: e.message } },
      {
        status: e.status,
        headers: {
          "Cache-Control": "no-store",
          ...(e.retryAfter ? { "Retry-After": String(e.retryAfter) } : {}),
        },
      },
    );
  }
}
