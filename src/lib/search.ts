import { Article } from "@/types";

/**
 * In-memory fulltext search index over articles from the last 48h.
 * Searches across title, description, source name, and category.
 */

// Store for search — in production, swap to Supabase fulltext or Elasticsearch
const articleStore = new Map<string, Article>();

/**
 * Index articles for search
 */
export function indexArticles(articles: Article[]): void {
  const cutoff = Date.now() - 48 * 60 * 60_000; // 48h
  for (const article of articles) {
    if (new Date(article.pubDate).getTime() >= cutoff) {
      articleStore.set(article.id, article);
    }
  }
  // Prune old articles
  for (const [id, article] of articleStore) {
    if (new Date(article.pubDate).getTime() < cutoff) {
      articleStore.delete(id);
    }
  }
}

/**
 * Search articles by query string.
 * Supports multi-word queries (all terms must match).
 * Returns results sorted by relevance then date.
 */
export function searchArticles(query: string, limit = 50): Article[] {
  if (!query.trim()) return [];

  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 1);

  if (terms.length === 0) return [];

  const results: { article: Article; score: number }[] = [];

  for (const article of articleStore.values()) {
    const titleLower = article.title.toLowerCase();
    const descLower = (article.description ?? "").toLowerCase();
    const sourceLower = article.sourceName.toLowerCase();
    const searchable = `${titleLower} ${descLower} ${sourceLower} ${article.category}`;

    // All terms must appear somewhere
    const allMatch = terms.every((term) => searchable.includes(term));
    if (!allMatch) continue;

    // Relevance scoring
    let score = 0;
    for (const term of terms) {
      // Title matches worth more
      if (titleLower.includes(term)) score += 10;
      // Description matches
      if (descLower.includes(term)) score += 3;
      // Exact word boundary match bonus
      const wordRegex = new RegExp(`\\b${term}\\b`);
      if (wordRegex.test(titleLower)) score += 5;
    }

    // Recency bonus (newer = higher)
    const ageHours =
      (Date.now() - new Date(article.pubDate).getTime()) / 3_600_000;
    score += Math.max(0, 10 - ageHours * 0.2);

    // Multi-source bonus
    if ((article.duplicateCount ?? 1) > 1) score += 3;

    results.push({ article, score });
  }

  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((r) => r.article);
}

/**
 * Get total indexed article count
 */
export function getIndexSize(): number {
  return articleStore.size;
}
