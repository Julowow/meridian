import { SourceConfig } from "@/types";

export const RSS_SOURCES: SourceConfig[] = [
  {
    id: "bbc-world",
    name: "BBC World",
    url: "https://feeds.bbci.co.uk/news/world/rss.xml",
    category: "world",
    color: "#BB1919",
  },
  {
    id: "bbc-business",
    name: "BBC Business",
    url: "https://feeds.bbci.co.uk/news/business/rss.xml",
    category: "economy",
    color: "#BB1919",
  },
  {
    id: "guardian-world",
    name: "Guardian World",
    url: "https://www.theguardian.com/world/rss",
    category: "world",
    color: "#052962",
  },
  {
    id: "guardian-economics",
    name: "Guardian Economics",
    url: "https://www.theguardian.com/business/economics/rss",
    category: "economy",
    color: "#052962",
  },
  {
    id: "aljazeera",
    name: "Al Jazeera",
    url: "https://www.aljazeera.com/xml/rss/all.xml",
    category: "world",
    color: "#FA9000",
  },
  {
    id: "reuters",
    name: "Reuters",
    url: "https://www.reutersagency.com/feed/?best-topics=political-general&post_type=best",
    category: "world",
    color: "#FF8000",
  },
  {
    id: "nyt-world",
    name: "NYT World",
    url: "https://rss.nytimes.com/services/xml/rss/nyt/World.xml",
    category: "world",
    color: "#1A1A1A",
  },
  {
    id: "nyt-business",
    name: "NYT Business",
    url: "https://rss.nytimes.com/services/xml/rss/nyt/Business.xml",
    category: "economy",
    color: "#1A1A1A",
  },
  {
    id: "ft",
    name: "Financial Times",
    url: "https://www.ft.com/rss/home",
    category: "markets",
    color: "#FFF1E5",
  },
];

export const CATEGORIES: { id: string; label: string }[] = [
  { id: "all", label: "TOUT" },
  { id: "world", label: "MONDE" },
  { id: "markets", label: "MARCHÉS" },
  { id: "economy", label: "ÉCONOMIE" },
  { id: "war-geo", label: "GUERRE & GÉO" },
  { id: "politics", label: "POLITIQUE" },
];

export const POLLING_INTERVAL_MS = 90_000; // 90 seconds
