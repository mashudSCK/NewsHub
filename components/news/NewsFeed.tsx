import LeadStory from "./LeadStory";
import ArticleRow from "./ArticleRow";
import type { Article } from "@/lib/news/types";
export default function NewsFeed({
  articles,
  variant = "home",
}: {
  articles: Article[];
  variant?: "home" | "category" | "search";
}) {
  if (!articles.length) return null;
  if (variant === "search")
    return (
      <div className="results-list">
        {articles.map((a) => (
          <ArticleRow key={a.id} article={a} headingLevel={2} />
        ))}
      </div>
    );
  const [lead, ...rest] = articles;
  return (
    <div
      className={`news-feed ${variant === "category" ? "category-feed" : ""}`}
    >
      <div className={`feature-grid ${rest.length ? "" : "single-feature"}`}>
        <LeadStory article={lead} />
        {rest.length > 0 && (
          <section
            className="supporting-stories"
            aria-labelledby="headlines-heading"
          >
            <h2 id="headlines-heading" className="section-title">
              In the headlines
            </h2>
            {rest.slice(0, 3).map((a) => (
              <ArticleRow key={a.id} article={a} compact />
            ))}
          </section>
        )}
      </div>
      {rest.length > 3 && (
        <section className="more-stories" aria-labelledby="more-heading">
          <div className="section-heading">
            <h2 id="more-heading">The wider picture</h2>
            <span>More stories to explore</span>
          </div>
          <div className="story-grid">
            {rest.slice(3).map((a) => (
              <ArticleRow key={a.id} article={a} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
