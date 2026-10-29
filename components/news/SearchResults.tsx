"use client";
import { useSearchParams } from "next/navigation";
import SearchBar from "@/components/SearchBar";
import NewsFeed from "./NewsFeed";
import { useNewsFeed } from "@/hooks/useNewsFeed";
import { EmptyState, ErrorState, FeedSkeleton } from "./FeedState";
export default function SearchResults() {
  const query = (useSearchParams().get("q") || "").trim();
  const feed = useNewsFeed({ query });
  return (
    <div className="page-content search-page">
      <div className="page-heading">
        <div>
          <h1>Follow your curiosity.</h1>
          <p>Find a story. Discover a different perspective.</p>
        </div>
      </div>
      <SearchBar initialQuery={query} />
      <div aria-live="polite" className="results-heading">
        {query && feed.status !== "loading" && !feed.error && (
          <p>
            {feed.articles.length} articles shown for <strong>“{query}”</strong>
          </p>
        )}
      </div>
      {feed.error && <ErrorState message={feed.error} retry={feed.retry} />}
      {feed.status === "loading" && !feed.articles.length ? (
        <FeedSkeleton />
      ) : feed.status === "empty" ? (
        <EmptyState search />
      ) : feed.status === "idle" ? (
        <section className="search-intro">
          <h2>There’s always more to the story.</h2>
          <p>
            Search by keyword, subject, or something you’ve been wondering
            about.
          </p>
        </section>
      ) : (
        <NewsFeed articles={feed.articles} variant="search" />
      )}
    </div>
  );
}
