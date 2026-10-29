"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NEWS_CATEGORIES } from "@/lib/news/categories";
export default function CategoryTabs() {
  const path = usePathname();
  return (
    <nav className="category-tabs" aria-label="News categories">
      {NEWS_CATEGORIES.map((c) => {
        const href = c.id === "general" ? "/" : `/category/${c.id}`;
        return (
          <Link
            key={c.id}
            href={href}
            aria-current={path === href ? "page" : undefined}
          >
            {c.name}
          </Link>
        );
      })}
    </nav>
  );
}
