import { Article } from "@/types";

// Stopwords to ignore during similarity comparison
const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
  "of", "with", "by", "from", "is", "are", "was", "were", "be", "been",
  "has", "have", "had", "do", "does", "did", "will", "would", "could",
  "should", "may", "might", "can", "shall", "not", "no", "nor", "so",
  "if", "then", "than", "that", "this", "these", "those", "it", "its",
  "as", "up", "out", "about", "into", "over", "after", "before",
  "between", "under", "again", "further", "also", "just", "more",
  "very", "too", "only", "own", "same", "other", "each", "every",
  "all", "both", "few", "most", "such", "some", "any", "new", "says",
  "said", "say", "amid", "according", "report", "reports", "news",
]);

/**
 * Extract meaningful tokens from text for comparison
 */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));
}

/**
 * Build a trigram set from text for fuzzy matching
 */
function trigrams(text: string): Set<string> {
  const normalized = text.toLowerCase().replace(/[^a-z0-9]/g, "");
  const set = new Set<string>();
  for (let i = 0; i <= normalized.length - 3; i++) {
    set.add(normalized.substring(i, i + 3));
  }
  return set;
}

/**
 * Jaccard similarity between two sets
 */
function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 1;
  let intersection = 0;
  for (const item of a) {
    if (b.has(item)) intersection++;
  }
  const union = a.size + b.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

/**
 * Compute similarity score between two articles (0-1)
 * Uses a combination of token overlap and trigram similarity
 */
function articleSimilarity(a: Article, b: Article): number {
  // Token-based similarity on title
  const tokensA = new Set(tokenize(a.title));
  const tokensB = new Set(tokenize(b.title));
  const tokenSim = jaccardSimilarity(tokensA, tokensB);

  // Trigram similarity on title (catches typos, slight rewording)
  const triA = trigrams(a.title);
  const triB = trigrams(b.title);
  const trigramSim = jaccardSimilarity(triA, triB);

  // Weighted combination: tokens matter more than trigrams
  return tokenSim * 0.6 + trigramSim * 0.4;
}

/**
 * Cluster articles by similarity using Union-Find
 */
export function deduplicateArticles(articles: Article[]): Article[] {
  const n = articles.length;
  if (n === 0) return [];

  // Union-Find
  const parent = Array.from({ length: n }, (_, i) => i);

  function find(x: number): number {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]];
      x = parent[x];
    }
    return x;
  }

  function union(x: number, y: number) {
    const px = find(x);
    const py = find(y);
    if (px !== py) parent[px] = py;
  }

  // Similarity threshold for considering articles as duplicates
  const SIMILARITY_THRESHOLD = 0.45;

  // Compare all pairs (O(n²) but n is typically < 500, so ~125k comparisons max)
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const sim = articleSimilarity(articles[i], articles[j]);
      if (sim >= SIMILARITY_THRESHOLD) {
        union(i, j);
      }
    }
  }

  // Group by cluster
  const clusters = new Map<number, number[]>();
  for (let i = 0; i < n; i++) {
    const root = find(i);
    if (!clusters.has(root)) clusters.set(root, []);
    clusters.get(root)!.push(i);
  }

  // Pick the best representative from each cluster
  const result: Article[] = [];
  for (const indices of clusters.values()) {
    // Sort by: most recent first, then prefer longer descriptions
    indices.sort((a, b) => {
      const dateA = new Date(articles[a].pubDate).getTime();
      const dateB = new Date(articles[b].pubDate).getTime();
      if (dateB !== dateA) return dateB - dateA;
      return (articles[b].description?.length ?? 0) - (articles[a].description?.length ?? 0);
    });

    const representative = { ...articles[indices[0]] };

    // Enrich with cluster metadata
    representative.duplicateCount = indices.length;
    representative.relatedSources = [
      ...new Set(indices.map((i) => articles[i].sourceName)),
    ];

    result.push(representative);
  }

  return result;
}
