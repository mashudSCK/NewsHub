"use client";
import Link from "next/link";
import { Search, Bookmark, Moon, Sun, ArrowUpRight } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useBookmarks } from "@/context/BookmarkContext";
import { usePathname } from "next/navigation";
import CategoryTabs from "./CategoryTabs";
export default function Navbar({ date, edition }) {
  const { theme, toggleTheme } = useTheme();
  const { bookmarks } = useBookmarks();
  const pathname = usePathname();
  return (
    <header className="site-header container">
      <div className="edition-bar">
        <span>{date}</span>
        <span className="edition-tag">{edition}</span>
        <span className="header-motto">
          A little perspective goes a long way.
        </span>
      </div>
      <div className="masthead">
        <Link href="/" className="wordmark" aria-label="NewsHub home">
          NewsHub<span aria-hidden="true">.</span>
        </Link>
        <p className="masthead-description">
          The world is moving.
          <br />
          Make sense of it.
        </p>
        <div className="header-actions">
          <Link
            href="/bookmarks"
            aria-labelledby="saved-label saved-count"
            className={`saved-link ${pathname === "/bookmarks" ? "active" : ""}`}
          >
            <Bookmark size={17} />
            <span id="saved-label">Saved</span>
            <span id="saved-count" className="saved-count">
              {bookmarks.length}
            </span>
          </Link>
          <button
            className="icon-button theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>
      <div className="navigation-row">
        <CategoryTabs />
        <Link
          className="nav-search"
          aria-label="Search stories"
          href="/search"
          aria-current={pathname === "/search" ? "page" : undefined}
        >
          <Search size={17} />
          <span>Search stories</span>
          <ArrowUpRight size={14} />
        </Link>
      </div>
    </header>
  );
}
