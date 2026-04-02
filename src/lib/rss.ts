import Parser from "rss-parser";
import { Article, Category, SourceConfig, SourceStatus } from "@/types";
import { RSS_SOURCES } from "@/config/sources";
import { deduplicateArticles } from "@/lib/dedup";
import { getCachedFeed, setCachedFeed } from "@/lib/cache";
import { enrichArticlesWithAI } from "@/lib/ai-summary";

const parser = new Parser({
  timeout: 10_000,
  headers: {
    "User-Agent": "Meridian/1.0 News Aggregator",
  },
});

function generateId(source: string, title: string): string {
  const str = `${source}:${title}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

function classifyCategory(
  item: Parser.Item,
  sourceConfig: SourceConfig
): Category {
  const text = `${item.title ?? ""} ${item.contentSnippet ?? ""}`.toLowerCase();

  const warKeywords = [
    "war", "conflict", "missile", "bomb", "military", "troops", "invasion",
    "attack", "drone", "airstrike", "ceasefire", "ukraine", "gaza", "hamas",
    "nato", "army", "soldier", "weapon", "guerre", "combat",
  ];
  const politicsKeywords = [
    "election", "president", "parliament", "minister", "senate", "congress",
    "vote", "policy", "democrat", "republican", "legislation", "trump",
    "biden", "macron", "politics", "political", "gouvernement", "parti",
  ];
  const marketKeywords = [
    "stock", "market", "dow", "nasdaq", "s&p", "crypto", "bitcoin",
    "trading", "investor", "wall street", "bull", "bear", "rally", "etf",
    "bond", "yield", "forex", "bourse",
  ];
  const economyKeywords = [
    "economy", "gdp", "inflation", "interest rate", "fed", "central bank",
    "recession", "unemployment", "fiscal", "trade", "tariff", "debt",
    "deficit", "imf", "world bank", "economic", "économie",
  ];

  if (warKeywords.some((kw) => text.includes(kw))) return "war-geo";
  if (politicsKeywords.some((kw) => text.includes(kw))) return "politics";
  if (marketKeywords.some((kw) => text.includes(kw))) return "markets";
  if (economyKeywords.some((kw) => text.includes(kw))) return "economy";
  return sourceConfig.category;
}

function isBreaking(pubDate: string): boolean {
  const diff = Date.now() - new Date(pubDate).getTime();
  return diff < 15 * 60 * 1000;
}

async function fetchSource(
  sourceConfig: SourceConfig
): Promise<{ articles: Article[]; status: SourceStatus }> {
  const status: SourceStatus = {
    id: sourceConfig.id,
    name: sourceConfig.name,
    online: false,
    articleCount: 0,
    lastFetch: null,
  };

  try {
    const feed = await parser.parseURL(sourceConfig.url);
    const articles: Article[] = (feed.items ?? []).map((item) => {
      const pubDate = item.pubDate ?? item.isoDate ?? new Date().toISOString();
      const category = classifyCategory(item, sourceConfig);

      return {
        id: generateId(sourceConfig.id, item.title ?? ""),
        title: item.title ?? "Untitled",
        description: item.contentSnippet ?? item.content ?? "",
        content: item.content ?? "",
        link: item.link ?? "",
        pubDate,
        source: sourceConfig.id,
        sourceName: sourceConfig.name,
        category,
        isBreaking: isBreaking(pubDate),
        isHot: false,
        imageUrl: item.enclosure?.url ?? undefined,
        duplicateCount: 1,
        relatedSources: [sourceConfig.name],
        aiSummary: null,
        aiEntities: [],
        aiSentiment: null,
      };
    });

    status.online = true;
    status.articleCount = articles.length;
    status.lastFetch = new Date().toISOString();

    return { articles, status };
  } catch (error) {
    console.error(`Failed to fetch ${sourceConfig.name}:`, error);
    return { articles: [], status };
  }
}

function markHotArticles(articles: Article[]): Article[] {
  return articles.map((article) => ({
    ...article,
    // HOT = covered by multiple sources (from dedup cluster)
    isHot: (article.duplicateCount ?? 1) > 1 || (article.relatedSources?.length ?? 1) > 1,
  }));
}

export async function fetchAllFeeds(): Promise<{
  articles: Article[];
  sources: SourceStatus[];
  fetchedAt: string;
}> {
  // Check cache first
  const cached = getCachedFeed();
  if (cached) {
    const updated = cached.articles.map((a) => ({
      ...a,
      isBreaking: isBreaking(a.pubDate),
    }));
    return { ...cached, articles: updated };
  }

  const results = await Promise.allSettled(
    RSS_SOURCES.map((source) => fetchSource(source))
  );

  let allArticles: Article[] = [];
  const allSources: SourceStatus[] = [];

  for (const result of results) {
    if (result.status === "fulfilled") {
      allArticles.push(...result.value.articles);
      allSources.push(result.value.status);
    }
  }

  // Sort by date (newest first)
  allArticles.sort(
    (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
  );

  // Advanced deduplication with similarity scoring
  allArticles = deduplicateArticles(allArticles);

  // Mark hot articles based on cluster size
  allArticles = markHotArticles(allArticles);

  // Enrich with AI summaries (placeholder — returns articles unchanged for now)
  allArticles = await enrichArticlesWithAI(allArticles);

  const feedData = {
    articles: allArticles,
    sources: allSources,
    fetchedAt: new Date().toISOString(),
  };

  // Store in cache
  setCachedFeed(feedData);

  return feedData;
}
