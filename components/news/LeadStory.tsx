import { ArrowUpRight } from "lucide-react";
import ArticleImage from "./ArticleImage";
import ArticleMeta from "./ArticleMeta";
import BookmarkButton from "./BookmarkButton";
import type { Article } from "@/lib/news/types";
export default function LeadStory({ article }: { article: Article }) {
  return (
    <article className="lead-story">
      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        tabIndex={-1}
        aria-hidden="true"
      >
        <ArticleImage src={article.image} priority />
      </a>
      <div className="lead-copy">
        <ArticleMeta article={article} />
        <h2>
          <a href={article.url} target="_blank" rel="noopener noreferrer">
            {article.title}
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </h2>
        {article.description && (
          <p className="article-description">{article.description}</p>
        )}
        <div className="article-actions">
          <a
            className="text-link"
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Read story: ${article.title} (opens in a new tab)`}
          >
            Read story <ArrowUpRight size={16} />
          </a>
          <BookmarkButton article={article} />
        </div>
      </div>
    </article>
  );
}
