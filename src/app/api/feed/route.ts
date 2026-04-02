import { NextResponse } from "next/server";
import { fetchAllFeeds } from "@/lib/rss";
import { MOCK_ARTICLES, MOCK_SOURCES } from "@/lib/mock-data";
import { indexArticles } from "@/lib/search";
import { processAlerts } from "@/lib/alerts";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await fetchAllFeeds();

    // If no articles from real feeds, use mock data for demo
    const articles = data.articles.length > 0 ? data.articles : MOCK_ARTICLES;
    const sources = data.articles.length > 0 ? data.sources : MOCK_SOURCES;

    // Index for fulltext search
    indexArticles(articles);

    // Process keyword alerts (sends Telegram if configured)
    processAlerts(articles).catch(console.error);

    return NextResponse.json({
      articles,
      sources,
      fetchedAt: data.fetchedAt,
    });
  } catch (error) {
    console.error("Feed API error:", error);
    return NextResponse.json({
      articles: MOCK_ARTICLES,
      sources: MOCK_SOURCES,
      fetchedAt: new Date().toISOString(),
    });
  }
}
