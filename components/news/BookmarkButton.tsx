"use client";
import { Bookmark, Check } from "lucide-react";
import { useBookmarks } from "@/context/BookmarkContext";
import type { Article } from "@/lib/news/types";
export default function BookmarkButton({ article }: { article: Article }) {
  const { isBookmarked, addBookmark, removeBookmark, isLoaded } =
    useBookmarks();
  const saved = isBookmarked(article.url);
  return (
    <button
      type="button"
      className={`icon-button bookmark-button ${saved ? "is-saved" : ""}`}
      disabled={!isLoaded}
      aria-label={`${saved ? "Remove saved article" : "Save article"}: ${article.title}`}
      aria-pressed={saved}
      onClick={() =>
        saved ? removeBookmark(article.url) : addBookmark(article)
      }
      title={saved ? "Remove from saved" : "Save for later"}
    >
      {saved ? <Check size={18} /> : <Bookmark size={18} />}
    </button>
  );
}
