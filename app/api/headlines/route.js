import { handleNewsRequest } from "@/lib/news/handler";
export const dynamic = "force-dynamic";
export async function GET(request) {
  return handleNewsRequest(request, "headlines");
}
