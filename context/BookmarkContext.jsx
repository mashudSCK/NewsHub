"use client";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { normalizeArticles } from "@/lib/news/normalize";
const BookmarkContext = createContext();
export function BookmarkProvider({ children }) {
  const [bookmarks, setBookmarks] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [storageError, setStorageError] = useState(null);
  const [message, setMessage] = useState("");
  const [lastRemoved, setLastRemoved] = useState(null);
  const dirty = useRef(false);
  const unreadable = useRef(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem("newsBookmarks");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) throw new Error("Invalid reading list");
        setBookmarks(normalizeArticles(parsed));
      }
    } catch {
      unreadable.current = true;
      setStorageError(
        "Saved articles could not be read on this device. Changes will stay in this session.",
      );
    } finally {
      setIsLoaded(true);
    }
  }, []);
  useEffect(() => {
    if (!isLoaded || !dirty.current || unreadable.current) return;
    try {
      localStorage.setItem("newsBookmarks", JSON.stringify(bookmarks));
      setStorageError(null);
      setMessage("Reading list updated on this device.");
    } catch {
      setStorageError(
        "Changes could not be saved to this device. Your reading list is available for this session.",
      );
      setMessage(
        "Reading list updated for this session only. Device storage is unavailable.",
      );
    }
  }, [bookmarks, isLoaded]);
  const addBookmark = (article) => {
    const normalized = normalizeArticles([article])[0];
    if (!normalized) return;
    dirty.current = true;
    setBookmarks((prev) =>
      prev.some((a) => a.url === normalized.url)
        ? prev
        : [{ ...normalized, bookmarkedAt: new Date().toISOString() }, ...prev],
    );
    setMessage(
      unreadable.current
        ? "Article added for this session only. Device storage is unavailable."
        : "Article added. Saving to this device…",
    );
  };
  const removeBookmark = (url) => {
    const article = bookmarks.find((a) => a.url === url);
    if (!article) return;
    dirty.current = true;
    setLastRemoved(article);
    setBookmarks((prev) => prev.filter((a) => a.url !== url));
    setMessage("Article removed. You can undo this in your saved list.");
  };
  const undoLastRemoval = () => {
    if (!lastRemoved) return;
    dirty.current = true;
    setBookmarks((prev) =>
      prev.some((a) => a.url === lastRemoved.url)
        ? prev
        : [lastRemoved, ...prev],
    );
    setLastRemoved(null);
    setMessage("Article restored.");
  };
  const clearAllBookmarks = () => {
    dirty.current = true;
    setBookmarks([]);
    setLastRemoved(null);
    setMessage("Reading list cleared.");
  };
  return (
    <BookmarkContext.Provider
      value={{
        bookmarks,
        isLoaded,
        storageError,
        message,
        lastRemoved,
        addBookmark,
        removeBookmark,
        undoLastRemoval,
        clearAllBookmarks,
        isBookmarked: (url) => bookmarks.some((a) => a.url === url),
      }}
    >
      {children}
      {storageError && (
        <div className="storage-banner" role="alert">
          {storageError}
        </div>
      )}
      <div className="sr-only" role="status" aria-live="polite">
        {message}
      </div>
    </BookmarkContext.Provider>
  );
}
export function useBookmarks() {
  const value = useContext(BookmarkContext);
  if (!value) throw new Error("useBookmarks requires BookmarkProvider");
  return value;
}
