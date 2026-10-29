import type { Article } from "./types";
export function safeUrl(value: unknown): string | null {
  if (typeof value !== "string" || value.length > 4096) return null;
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    if (
      !["http:", "https:"].includes(url.protocol) ||
      url.username ||
      url.password ||
      !host.includes(".") ||
      host.includes(":") ||
      /(^|\.)(localhost|local|internal|test|invalid)$/.test(host)
    )
      return null;
    if (
      /^(0|10|127|169\.254|192\.168)\./.test(host) ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(host) ||
      /^(22[4-9]|23\d|24\d|25[0-5])\./.test(host)
    )
      return null;
    url.hash = "";
    return url.href;
  } catch {
    return null;
  }
}
export function normalizeArticles(value: unknown): Article[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  return value.flatMap((item): Article[] => {
    if (!item || typeof item !== "object") return [];
    const url = safeUrl(item.url);
    const title =
      typeof item.title === "string" ? item.title.trim().slice(0, 500) : "";
    if (!url || !title || seen.has(url)) return [];
    seen.add(url);
    const image = safeUrl(item.image || item.urlToImage);
    const timestamp =
      typeof item.publishedAt === "string" ? Date.parse(item.publishedAt) : NaN;
    return [
      {
        id: url,
        url,
        title,
        description:
          typeof item.description === "string"
            ? item.description.trim().slice(0, 2000) || null
            : null,
        image: image?.startsWith("https://") ? image : null,
        source: {
          name:
            typeof item.source?.name === "string" && item.source.name.trim()
              ? item.source.name.trim().slice(0, 120)
              : new URL(url).hostname.replace(/^www\./, ""),
          url: safeUrl(item.source?.url),
        },
        publishedAt: Number.isFinite(timestamp)
          ? new Date(timestamp).toISOString()
          : null,
        ...(typeof item.bookmarkedAt === "string" &&
        Number.isFinite(Date.parse(item.bookmarkedAt))
          ? { bookmarkedAt: item.bookmarkedAt }
          : {}),
      },
    ];
  });
}
