import { buildSearchIndex } from "@/lib/searchIndex";

// Generated at build time; the search dialog fetches it the first time it opens.
export const dynamic = "force-static";

export function GET() {
  return Response.json(buildSearchIndex());
}
