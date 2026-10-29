import ArticleImage from "./ArticleImage";
import ArticleMeta from "./ArticleMeta";
import BookmarkButton from "./BookmarkButton";
import type { Article } from "@/lib/news/types";
export default function ArticleRow({
  article,
  compact = false,
  headingLevel = 3,
}: {
  article: Article;
  compact?: boolean;
  headingLevel?: 2 | 3;
}) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return (
    <article className={`article-row ${compact ? "compact-story" : ""}`}>
      <div className="row-copy">
        <ArticleMeta article={article} />
        <Heading>
          <a href={article.url} target="_blank" rel="noopener noreferrer">
            {article.title}
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </Heading>
        {!compact && article.description && (
          <p className="article-description">{article.description}</p>
        )}
        <BookmarkButton article={article} />
      </div>
      <ArticleImage src={article.image} />
    </article>
  );
}
