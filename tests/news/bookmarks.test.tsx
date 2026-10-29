import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { expect, it, beforeEach, vi, afterEach } from "vitest";
import { BookmarkProvider, useBookmarks } from "@/context/BookmarkContext";
const article = {
  title: "A story",
  url: "https://example.com/a",
  source: { name: "Example" },
  publishedAt: null,
};
function Reader() {
  const b = useBookmarks();
  return (
    <>
      <output>{b.bookmarks.length}</output>
      <button onClick={() => b.addBookmark(article)}>Add</button>
      <button onClick={() => b.removeBookmark(article.url)}>Remove</button>
      <button onClick={b.undoLastRemoval}>Undo</button>
    </>
  );
}
beforeEach(() => localStorage.clear());
afterEach(() => vi.restoreAllMocks());
it("shows session-only persistence failures even when the consumer renders no notice", async () => {
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
    throw new Error("quota");
  });
  render(
    <BookmarkProvider>
      <Reader />
    </BookmarkProvider>,
  );
  fireEvent.click(screen.getByText("Add"));
  expect(screen.getByRole("alert")).toHaveTextContent("session");
  await waitFor(() =>
    expect(
      screen
        .getAllByRole("status")
        .some((s) => s.textContent?.includes("session only")),
    ).toBe(true),
  );
});
it("preserves all valid legacy bookmarks through load and the next mutation", async () => {
  const entries = Array.from({ length: 501 }, (_, i) => ({
    ...article,
    url: `https://example.com/saved/${i}`,
  }));
  localStorage.setItem("newsBookmarks", JSON.stringify(entries));
  render(
    <BookmarkProvider>
      <Reader />
    </BookmarkProvider>,
  );
  expect(screen.getByText("501", { selector: "output" })).toBeInTheDocument();
  fireEvent.click(screen.getByText("Add"));
  await waitFor(() =>
    expect(JSON.parse(localStorage.getItem("newsBookmarks")!)).toHaveLength(
      502,
    ),
  );
});
it("deduplicates, persists and restores removed articles", async () => {
  const view = render(
    <BookmarkProvider>
      <Reader />
    </BookmarkProvider>,
  );
  fireEvent.click(screen.getByText("Add"));
  fireEvent.click(screen.getByText("Add"));
  expect(screen.getByText("1", { selector: "output" })).toBeInTheDocument();
  fireEvent.click(screen.getByText("Remove"));
  expect(screen.getByText("0", { selector: "output" })).toBeInTheDocument();
  fireEvent.click(screen.getByText("Undo"));
  expect(screen.getByText("1", { selector: "output" })).toBeInTheDocument();
  await waitFor(() =>
    expect(JSON.parse(localStorage.getItem("newsBookmarks")!)).toHaveLength(1),
  );
  view.unmount();
  render(
    <BookmarkProvider>
      <Reader />
    </BookmarkProvider>,
  );
  expect(screen.getByText("1", { selector: "output" })).toBeInTheDocument();
});
it("skips invalid legacy entries and handles corrupt storage without overwriting it", () => {
  localStorage.setItem("newsBookmarks", "broken json");
  render(
    <BookmarkProvider>
      <Reader />
    </BookmarkProvider>,
  );
  expect(screen.getByRole("alert")).toBeInTheDocument();
  expect(localStorage.getItem("newsBookmarks")).toBe("broken json");
});
it("keeps the reader usable when storage is unavailable", () => {
  vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
    throw new Error("blocked");
  });
  render(
    <BookmarkProvider>
      <Reader />
    </BookmarkProvider>,
  );
  fireEvent.click(screen.getByText("Add"));
  expect(screen.getByText("1", { selector: "output" })).toBeInTheDocument();
  expect(screen.getByRole("alert")).toBeInTheDocument();
});
