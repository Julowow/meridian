import { NextRequest, NextResponse } from "next/server";
import { searchArticles, indexArticles, getIndexSize } from "@/lib/search";
import { fetchAllFeeds } from "@/lib/rss";
import { MOCK_ARTICLES } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") ?? "";

  if (!query.trim()) {
    return NextResponse.json({ results: [], query: "", total: 0 });
  }

  // Ensure index is populated
  if (getIndexSize() === 0) {
    const feed = await fetchAllFeeds();
    const articles = feed.articles.length > 0 ? feed.articles : MOCK_ARTICLES;
    indexArticles(articles);
  }

  const results = searchArticles(query);

  return NextResponse.json({
    results,
    query,
    total: results.length,
  });
}
