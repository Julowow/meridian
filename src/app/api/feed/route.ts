import { NextResponse } from "next/server";
import { fetchAllFeeds } from "@/lib/rss";
import { MOCK_ARTICLES, MOCK_SOURCES } from "@/lib/mock-data";
import { indexArticles } from "@/lib/search";
import { processAlerts } from "@/lib/alerts";
import { enrichArticlesWithAI } from "@/lib/ai-summary";
import { Article } from "@/types";

export const dynamic = "force-dynamic";

// Background AI enrichment store
let enrichedArticles: Map<string, Article> = new Map();
let enrichmentInProgress = false;

async function backgroundEnrich(articles: Article[]) {
  if (enrichmentInProgress) return;
  enrichmentInProgress = true;
  try {
    const enriched = await enrichArticlesWithAI(articles);
    for (const article of enriched) {
      if (article.aiSummary) {
        enrichedArticles.set(article.id, article);
      }
    }
  } catch (e) {
    console.error("Background AI enrichment error:", e);
  } finally {
    enrichmentInProgress = false;
  }
}

export async function GET() {
  try {
    const data = await fetchAllFeeds();

    // If no articles from real feeds, use mock data for demo
    let articles = data.articles.length > 0 ? data.articles : [...MOCK_ARTICLES];
    const sources = data.articles.length > 0 ? data.sources : MOCK_SOURCES;

    // Apply any previously computed AI summaries
    articles = articles.map((a) => {
      const enriched = enrichedArticles.get(a.id);
      if (enriched) {
        return {
          ...a,
          aiSummary: enriched.aiSummary,
          aiEntities: enriched.aiEntities,
          aiSentiment: enriched.aiSentiment,
        };
      }
      return a;
    });

    // Kick off background AI enrichment (non-blocking)
    backgroundEnrich(articles).catch(console.error);

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
