import { notFound } from "next/navigation";
import { NEWS_CATEGORIES } from "@/lib/news/categories";
import FeedPage from "@/components/news/FeedPage";
import { initialHeadlines } from "@/lib/news/initial";
export async function generateMetadata({ params }) {
  const { category: slug } = await params;
  const category = NEWS_CATEGORIES.find((c) => c.id === slug);
  return {
    title: category
      ? `${category.name} — NewsHub`
      : "Category not found — NewsHub",
  };
}
export default async function CategoryPage({ params }) {
  const { category: slug } = await params;
  const category = NEWS_CATEGORIES.find((c) => c.id === slug);
  if (!category) notFound();
  return (
    <FeedPage
      key={category.id}
      {...await initialHeadlines(category.id)}
      category={category.id}
      title={category.name}
      description={`A closer look at ${category.name.toLowerCase()}. Stories worth your attention.`}
    />
  );
}
