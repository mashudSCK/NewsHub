"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { NewsResult } from "@/lib/news/types";
type Status = "idle" | "loading" | "success" | "empty" | "error";
export function useNewsFeed({
  category = "general",
  query,
  initialData,
  initialError = null,
}: {
  category?: string;
  query?: string;
  initialData?: NewsResult | null;
  initialError?: string | null;
}) {
  const [data, setData] = useState<NewsResult>(
    initialData || {
      articles: [],
      fetchedAt: "",
      mode: "demo",
    },
  );
  const [status, setStatus] = useState<Status>(
    initialError
      ? "error"
      : initialData
        ? initialData.articles.length
          ? "success"
          : "empty"
        : query === ""
          ? "idle"
          : "loading",
  );
  const [error, setError] = useState<string | null>(initialError);
  const [refresh, setRefresh] = useState(0);
  const sequence = useRef(0);
  const initialKey = useRef(
    query === undefined ? `category:${category}` : `search:${query}`,
  );
  const previousKey = useRef(initialKey.current);
  const retry = useCallback(() => setRefresh((n) => n + 1), []);
  useEffect(() => {
    const id = ++sequence.current;
    const controller = new AbortController();
    const key =
      query === undefined ? `category:${category}` : `search:${query}`;
    if (
      refresh === 0 &&
      key === initialKey.current &&
      (initialData || initialError)
    ) {
      return () => controller.abort();
    }
    if (key !== previousKey.current) {
      setData({ articles: [], fetchedAt: "", mode: "demo" });
      previousKey.current = key;
    }
    setError(null);
    if (query !== undefined && !query.trim()) {
      setStatus("idle");
      return () => controller.abort();
    }
    setStatus("loading");
    const path = query === undefined ? "headlines" : "search";
    const params = new URLSearchParams(
      query === undefined ? { category } : { q: query.trim() },
    );
    fetch(`/api/${path}?${params}`, {
      signal: controller.signal,
      cache: "no-store",
    })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok)
          throw new Error(
            result.error?.message ||
              "News could not be loaded. Please try again.",
          );
        return result as NewsResult;
      })
      .then((result) => {
        if (sequence.current !== id || controller.signal.aborted) return;
        setData(result);
        setStatus(result.articles.length ? "success" : "empty");
      })
      .catch((err) => {
        if (sequence.current !== id || controller.signal.aborted) return;
        setError(err.message || "Connection interrupted. Please try again.");
        setStatus("error");
      });
    return () => controller.abort();
  }, [category, query, refresh, initialData, initialError]);
  return { ...data, status, error, retry };
}
