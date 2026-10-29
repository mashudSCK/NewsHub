"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X, ArrowRight } from "lucide-react";
export default function SearchBar({ initialQuery = "" }) {
  const [query, setQuery] = useState(initialQuery);
  const router = useRouter();
  useEffect(() => setQuery(initialQuery), [initialQuery]);
  function search(value) {
    const trimmed = value.trim();
    router.push(
      trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : "/search",
    );
  }
  return (
    <form
      className="search-form"
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        search(query);
      }}
    >
      <label className="sr-only" htmlFor="news-search">
        Search news
      </label>
      <div className="search-field">
        <Search size={22} />
        <input
          id="news-search"
          name="q"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          maxLength={200}
          placeholder="What would you like to understand?"
          autoComplete="off"
        />
        {query && (
          <button
            className="icon-button"
            type="button"
            aria-label="Clear search"
            onClick={() => {
              setQuery("");
              search("");
            }}
          >
            <X size={18} />
          </button>
        )}
        <button
          className="button search-submit"
          type="submit"
          aria-label="Search"
        >
          <span>Search</span>
          <ArrowRight size={18} />
        </button>
      </div>
      <div className="search-suggestions">
        <span>Explore a topic</span>
        {["Climate", "AI", "Cities", "Science"].map((s) => (
          <button
            type="button"
            key={s}
            onClick={() => {
              setQuery(s);
              search(s);
            }}
          >
            {s}
            <ArrowUpRightIcon />
          </button>
        ))}
      </div>
    </form>
  );
}
function ArrowUpRightIcon() {
  return (
    <svg
      aria-hidden="true"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M6 18 18 6M6 6h12v12" />
    </svg>
  );
}
