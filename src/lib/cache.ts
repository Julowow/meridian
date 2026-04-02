import { Article, SourceStatus } from "@/types";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

/**
 * In-memory cache with TTL support.
 * Drop-in replacement for Redis — swap to Upstash when ready.
 *
 * To switch to Upstash Redis:
 *   npm install @upstash/redis
 *   Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN env vars
 *   Replace get/set calls with Redis.get/set
 */
class MemoryCache {
  private store = new Map<string, CacheEntry<unknown>>();

  get<T>(key: string): T | null {
    const entry = this.store.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.store.delete(key);
      return null;
    }
    return entry.data;
  }

  set<T>(key: string, data: T, ttlMs: number): void {
    this.store.set(key, { data, timestamp: Date.now(), ttl: ttlMs });
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}

const cache = new MemoryCache();

// Cache keys
const ARTICLES_KEY = "feed:articles";
const SOURCES_KEY = "feed:sources";
const HISTORY_KEY = "feed:history";

// TTLs
const FEED_CACHE_TTL = 60_000; // 60s for main feed
const HISTORY_TTL = 24 * 60 * 60_000; // 24h for article history

interface FeedCache {
  articles: Article[];
  sources: SourceStatus[];
  fetchedAt: string;
}

/**
 * Get cached feed data if still fresh
 */
export function getCachedFeed(): FeedCache | null {
  return cache.get<FeedCache>(ARTICLES_KEY);
}

/**
 * Cache feed data
 */
export function setCachedFeed(data: FeedCache): void {
  cache.set(ARTICLES_KEY, data, FEED_CACHE_TTL);

  // Also append to history for dedup across fetches
  const history = cache.get<Map<string, Article>>(HISTORY_KEY) ?? new Map();
  for (const article of data.articles) {
    history.set(article.id, article);
  }
  cache.set(HISTORY_KEY, history, HISTORY_TTL);
}

/**
 * Get article history (all articles seen in last 24h)
 */
export function getArticleHistory(): Article[] {
  const history = cache.get<Map<string, Article>>(HISTORY_KEY);
  if (!history) return [];
  return Array.from(history.values());
}

/**
 * Per-source adaptive polling interval
 * Sources with more articles = "hotter" = refresh more often
 */
export function getSourcePollInterval(articleCount: number): number {
  if (articleCount > 30) return 45_000;   // Hot source: 45s
  if (articleCount > 15) return 90_000;   // Normal: 90s
  return 120_000;                          // Quiet: 120s
}
