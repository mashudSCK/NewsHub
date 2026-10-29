import { describe, it, expect } from "vitest";
import { normalizeArticles, safeUrl } from "@/lib/news/normalize";
const story = {
  title: "A story",
  url: "https://example.com/story#section",
  publishedAt: "bad",
  image: "javascript:alert(1)",
};
describe("provider boundary", () => {
  it("discards invalid entries and deduplicates article links", () => {
    const articles = normalizeArticles([
      story,
      { ...story, url: "https://example.com/story" },
      null,
      { title: "Missing URL" },
      { ...story, url: "javascript:alert(1)" },
    ]);
    expect(articles).toHaveLength(1);
    expect(articles[0]).toMatchObject({
      url: "https://example.com/story",
      publishedAt: null,
      image: null,
      source: { name: "example.com", url: null },
    });
  });
  it("treats malformed collections as empty and rejects private destinations", () => {
    expect(normalizeArticles({ articles: [] })).toEqual([]);
    for (const url of [
      "http://127.0.0.1/a",
      "https://localhost/a",
      "https://192.168.1.2/a",
      "https://[::1]/a",
      "https://user:pass@example.com/a",
    ])
      expect(safeUrl(url)).toBeNull();
  });
});
