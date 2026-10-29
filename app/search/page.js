import { Suspense } from "react";
import SearchResults from "@/components/news/SearchResults";
export const metadata = { title: "Search — NewsHub" };
export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="page-content" role="status">
          Preparing search…
        </div>
      }
    >
      <SearchResults />
    </Suspense>
  );
}
