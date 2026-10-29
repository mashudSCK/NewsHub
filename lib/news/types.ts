export type Article = {
  id: string;
  url: string;
  title: string;
  description: string | null;
  image: string | null;
  source: { name: string; url: string | null };
  publishedAt: string | null;
  bookmarkedAt?: string;
};
export type NewsResult = {
  articles: Article[];
  fetchedAt: string;
  mode: "demo" | "live";
};
export type NewsParams = {
  category: string;
  country: string;
  language: string;
  query?: string;
};
