import { render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import NewsFeed from "@/components/news/NewsFeed";
import { formatDate } from "@/utils/formatDate";
vi.mock("@/context/BookmarkContext", () => ({
  useBookmarks: () => ({
    isBookmarked: () => false,
    addBookmark: () => {},
    removeBookmark: () => {},
    isLoaded: true,
  }),
}));
it.each([0, 1, 3, 10])(
  "renders each of %i available articles once",
  (count) => {
    const articles = Array.from({ length: count }, (_, i) => ({
      id: String(i),
      url: `https://example.com/${i}`,
      title: `Story ${i}`,
      description: null,
      image: null,
      source: { name: "Example", url: null },
      publishedAt: null,
    }));
    render(<NewsFeed articles={articles} variant="home" />);
    expect(screen.queryAllByRole("article")).toHaveLength(count);
    for (const a of articles)
      expect(
        screen.getAllByRole("link", {
          name: new RegExp("^" + a.title + "\\s*\\(opens in a new tab\\)$"),
        }),
      ).toHaveLength(1);
  },
);
it("never displays invalid or negative relative dates", () => {
  expect(formatDate(null)).toBe("Date unavailable");
  expect(formatDate("bad")).toBe("Date unavailable");
  expect(formatDate("2099-01-01T00:00:00Z")).not.toContain("ago");
});
it("keeps search result headings directly below the page heading", () => {
  const article = {
    id: "a",
    url: "https://example.com/a",
    title: "Result",
    description: null,
    image: null,
    source: { name: "Example", url: null },
    publishedAt: null,
  };
  render(<NewsFeed articles={[article]} variant="search" />);
  expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Result");
});
