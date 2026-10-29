import "server-only";
import { normalizeArticles } from "./normalize";
import type { NewsParams, NewsResult } from "./types";
export class NewsError extends Error {
  constructor(
    public code: string,
    public status: number,
    message: string,
    public retryAfter?: number,
  ) {
    super(message);
  }
}
export async function fetchProvider(
  kind: "headlines" | "search",
  params: NewsParams,
  key: string,
  fetcher: typeof fetch = fetch,
): Promise<NewsResult> {
  const search = new URLSearchParams({
    apikey: key,
    country: params.country,
    lang: params.language,
    max: "10",
  });
  if (kind === "search") {
    search.set("q", params.query!);
    search.set("sortby", "publishedAt");
  } else search.set("category", params.category);
  try {
    const response = await fetcher(
      `https://gnews.io/api/v4/${kind === "headlines" ? "top-headlines" : "search"}?${search}`,
      { cache: "no-store", signal: AbortSignal.timeout(10000) },
    );
    if (response.status === 429 || response.status === 403)
      throw new NewsError(
        "RATE_LIMITED",
        429,
        "The news provider is temporarily unavailable. Please try again later.",
        300,
      );
    if (!response.ok) throw new Error("Upstream failure");
    const data = await response.json();
    return {
      articles: normalizeArticles(data.articles).slice(0, 10),
      fetchedAt: new Date().toISOString(),
      mode: "live",
    };
  } catch (e) {
    if (e instanceof NewsError) throw e;
    throw new NewsError(
      "UPSTREAM_UNAVAILABLE",
      502,
      "News could not be loaded. Please try again.",
    );
  }
}
