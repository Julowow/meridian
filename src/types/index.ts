export interface Article {
  id: string;
  title: string;
  description: string;
  content?: string;
  link: string;
  pubDate: string;
  source: SourceId;
  sourceName: string;
  category: Category;
  isBreaking: boolean;
  isHot: boolean;
  imageUrl?: string;
  // Phase 2: dedup cluster
  duplicateCount?: number;
  relatedSources?: string[];
  // Phase 2: AI summary placeholder
  aiSummary?: string | null;
  aiEntities?: string[];
  aiSentiment?: "positive" | "neutral" | "negative" | "alarming" | null;
}

export type Category =
  | "world"
  | "markets"
  | "economy"
  | "war-geo"
  | "politics"
  | "all";

export type SourceId =
  | "bbc-world"
  | "bbc-business"
  | "guardian-world"
  | "guardian-economics"
  | "aljazeera"
  | "reuters"
  | "nyt-world"
  | "nyt-business"
  | "ft";

export interface SourceConfig {
  id: SourceId;
  name: string;
  url: string;
  category: Category;
  color: string;
}

export interface SourceStatus {
  id: SourceId;
  name: string;
  online: boolean;
  articleCount: number;
  lastFetch: string | null;
}

export interface FeedResponse {
  articles: Article[];
  sources: SourceStatus[];
  fetchedAt: string;
}

export type TimeFilter = "1h" | "6h" | "24h";
export type SortMode = "chrono" | "relevance";
