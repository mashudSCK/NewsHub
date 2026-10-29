import { formatDate } from "@/utils/formatDate";
import type { Article } from "@/lib/news/types";
export default function ArticleMeta({ article }: { article: Article }) {
  return (
    <div className="article-meta">
      <span className="source-name">{article.source.name}</span>
      <span className="meta-dot" aria-hidden="true">
        ·
      </span>
      <time
        dateTime={article.publishedAt || undefined}
        title={article.publishedAt || undefined}
      >
        {formatDate(article.publishedAt)}
      </time>
    </div>
  );
}
