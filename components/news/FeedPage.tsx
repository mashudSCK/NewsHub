"use client";
import { RefreshCw } from "lucide-react";
import { useNewsFeed } from "@/hooks/useNewsFeed";
import NewsFeed from "./NewsFeed";
import { EmptyState, ErrorState, FeedSkeleton } from "./FeedState";
import type { NewsResult } from "@/lib/news/types";
export default function FeedPage({
  category = "general",
  title = "Top stories",
  description = "A wider view of the world. Start with what matters.",
  initialData,
  initialError,
}: {
  category?: string;
  title?: string;
  description?: string;
  initialData?: NewsResult | null;
  initialError?: string | null;
}) {
  const feed = useNewsFeed({ category, initialData, initialError });
  return (
    <div className="page-content">
      <div className="page-heading">
        <div>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        <button
          className="refresh-button"
          onClick={feed.retry}
          disabled={feed.status === "loading"}
        >
          <RefreshCw size={14} /> Refresh stories
        </button>
      </div>
      {feed.error && <ErrorState message={feed.error} retry={feed.retry} />}
      {feed.status === "loading" && !feed.articles.length ? (
        <FeedSkeleton />
      ) : feed.status === "empty" ? (
        <EmptyState />
      ) : (
        <NewsFeed
          articles={feed.articles}
          variant={category === "general" ? "home" : "category"}
        />
      )}
      {feed.articles.length > 0 && (
        <div className="feed-end">
          <span>{feed.articles.length} articles shown</span>
          <span>
            {feed.mode === "demo"
              ? "Illustrative edition · not live reporting"
              : `Feed fetched ${new Date(feed.fetchedAt).toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" })}`}
          </span>
        </div>
      )}
    </div>
  );
}
