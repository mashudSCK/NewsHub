"use client";
import { useRef } from "react";
import Link from "next/link";
import { Bookmark, ArrowRight, Trash2 } from "lucide-react";
import { useBookmarks } from "@/context/BookmarkContext";
import NewsFeed from "@/components/news/NewsFeed";
export default function BookmarksPage() {
  const {
    bookmarks,
    isLoaded,
    lastRemoved,
    undoLastRemoval,
    clearAllBookmarks,
  } = useBookmarks();
  const dialog = useRef(null);
  const clearButton = useRef(null);
  const sorted = [...bookmarks].sort(
    (a, b) =>
      Date.parse(b.bookmarkedAt || "") - Date.parse(a.bookmarkedAt || ""),
  );
  function close() {
    dialog.current.close();
    clearButton.current?.focus();
  }
  return (
    <div className="page-content reading-list">
      <div className="page-heading">
        <div>
          <h1>Your reading list.</h1>
          <p className="reading-description">
            Good stories deserve a little more time. Keep them here for later.
          </p>
        </div>
      </div>
      <div className="reading-list-meta">
        <span>
          {isLoaded ? bookmarks.length : "…"} saved{" "}
          {bookmarks.length === 1 ? "story" : "stories"} · Stored on this device
        </span>
        {bookmarks.length > 0 && (
          <button
            ref={clearButton}
            className="text-link"
            style={{ border: 0, background: "transparent" }}
            onClick={() => dialog.current.showModal()}
          >
            <Trash2 size={14} />
            Clear list
          </button>
        )}
      </div>
      {lastRemoved && (
        <div className="undo-notice">
          <span>Story removed from your list.</span>
          <button onClick={undoLastRemoval}>Undo removal</button>
        </div>
      )}
      {sorted.length ? (
        <NewsFeed articles={sorted} variant="search" />
      ) : (
        <div className="empty-state" aria-busy={!isLoaded}>
          <Bookmark size={30} strokeWidth={1.2} />
          <h2>A place for your next good read.</h2>
          <p>
            Save a story with the bookmark button. It will be waiting here when
            you have a moment.
          </p>
          <Link className="text-link" href="/">
            Find a story <ArrowRight size={16} />
          </Link>
        </div>
      )}
      <dialog
        ref={dialog}
        className="clear-dialog"
        aria-labelledby="clear-title"
        aria-describedby="clear-description"
        onCancel={() => clearButton.current?.focus()}
      >
        <h2 id="clear-title">Clear your reading list?</h2>
        <p id="clear-description">
          This removes all saved stories from this device. This action cannot be
          undone.
        </p>
        <div className="dialog-actions">
          <button autoFocus className="button button-outline" onClick={close}>
            Keep stories
          </button>
          <button
            className="button"
            onClick={() => {
              clearAllBookmarks();
              close();
            }}
          >
            Clear all stories
          </button>
        </div>
      </dialog>
    </div>
  );
}
