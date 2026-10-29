"use client";
import Link from "next/link";
import { ArrowRight, RefreshCw, Search } from "lucide-react";
export function FeedSkeleton() {
  return (
    <div className="feed-skeleton" role="status" aria-label="Loading stories">
      <div className="skeleton-lead">
        <div />
        <span />
        <span />
        <span />
      </div>
      <div className="skeleton-side">
        {[0, 1, 2].map((i) => (
          <div key={i}>
            <span />
            <span />
            <span />
          </div>
        ))}
      </div>
      <span className="sr-only">Loading stories…</span>
    </div>
  );
}
export function EmptyState({ search = false }: { search?: boolean }) {
  return (
    <div className="empty-state">
      <Search size={28} strokeWidth={1.3} />
      <h2>{search ? "No stories found" : "A quiet moment in this edition"}</h2>
      <p>
        {search
          ? "Try another keyword or a broader topic."
          : "There are no stories available right now. Please check back later."}
      </p>
      <Link className="text-link" href="/">
        Explore top stories <ArrowRight size={16} />
      </Link>
    </div>
  );
}
export function ErrorState({
  message,
  retry,
}: {
  message: string;
  retry: () => void;
}) {
  return (
    <div className="error-notice" role="alert">
      <div>
        <strong>We couldn’t load the latest stories.</strong>
        <p>{message}</p>
      </div>
      <button className="button button-outline" onClick={retry}>
        <RefreshCw size={16} /> Try again
      </button>
    </div>
  );
}
