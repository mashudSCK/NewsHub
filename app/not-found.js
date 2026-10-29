import Link from "next/link";
import { ArrowLeft } from "lucide-react";
export default function NotFound() {
  return (
    <div className="empty-state">
      <h1>This page isn’t in the edition.</h1>
      <p>Try a different category or head back to the top stories.</p>
      <Link className="text-link" href="/">
        <ArrowLeft size={16} />
        Back to top stories
      </Link>
    </div>
  );
}
