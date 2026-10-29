import "server-only";
import { headers } from "next/headers";
import { handleNewsRequest } from "./handler";
import type { NewsResult } from "./types";

// Reuse the same validation, budget and cache boundaries without making an HTTP round trip.
export async function initialHeadlines(
  category = "general",
): Promise<{ initialData: NewsResult | null; initialError: string | null }> {
  const incoming = await headers();
  const forwarded = incoming.get("x-vercel-forwarded-for");
  const request = new Request(
    `http://newshub.local/api/headlines?category=${encodeURIComponent(category)}`,
    { headers: forwarded ? { "x-vercel-forwarded-for": forwarded } : {} },
  );
  const response = await handleNewsRequest(request, "headlines");
  const result = await response.json();
  return response.ok
    ? { initialData: result, initialError: null }
    : { initialData: null, initialError: result.error.message };
}
