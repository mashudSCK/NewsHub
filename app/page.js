import FeedPage from "@/components/news/FeedPage";
import { initialHeadlines } from "@/lib/news/initial";
export default async function HomePage() {
  return <FeedPage {...await initialHeadlines()} />;
}
