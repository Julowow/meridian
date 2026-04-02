import { NextResponse } from "next/server";
import { fetchAllFeeds } from "@/lib/rss";
import { MOCK_ARTICLES, MOCK_SOURCES } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await fetchAllFeeds();

    // If no articles from real feeds, use mock data for demo
    if (data.articles.length === 0) {
      return NextResponse.json({
        articles: MOCK_ARTICLES,
        sources: MOCK_SOURCES,
        fetchedAt: new Date().toISOString(),
      });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Feed API error:", error);
    // Fallback to mock data on error
    return NextResponse.json({
      articles: MOCK_ARTICLES,
      sources: MOCK_SOURCES,
      fetchedAt: new Date().toISOString(),
    });
  }
}
