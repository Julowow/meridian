"use client";

import { useState, useMemo } from "react";
import { Category, SourceId, TimeFilter } from "@/types";
import { RSS_SOURCES } from "@/config/sources";
import { useFeed } from "@/hooks/useFeed";
import Header from "./Header";
import TickerTape from "./TickerTape";
import FilterBar from "./FilterBar";
import ArticleCard from "./ArticleCard";
import Sidebar from "./Sidebar";
import SearchBar from "./SearchBar";
import AlertsPanel from "./AlertsPanel";
import HeatMap from "./HeatMap";
import { Loader2 } from "lucide-react";

const TIME_FILTER_MS: Record<TimeFilter, number> = {
  "1h": 60 * 60 * 1000,
  "6h": 6 * 60 * 60 * 1000,
  "24h": 24 * 60 * 60 * 1000,
};

export default function Dashboard() {
  const { articles, sources, loading, error, refresh, unreadCount, clearUnread } =
    useFeed();

  const [activeCategory, setActiveCategory] = useState<Category>("all");
  const [activeSources, setActiveSources] = useState<Set<SourceId>>(
    new Set(RSS_SOURCES.map((s) => s.id))
  );
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("24h");

  const handleToggleSource = (id: SourceId) => {
    setActiveSources((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const filteredArticles = useMemo(() => {
    const now = Date.now();
    const cutoff = now - TIME_FILTER_MS[timeFilter];

    return articles.filter((article) => {
      // Time filter
      if (new Date(article.pubDate).getTime() < cutoff) return false;
      // Category filter
      if (activeCategory !== "all" && article.category !== activeCategory)
        return false;
      // Source filter
      if (!activeSources.has(article.source)) return false;
      return true;
    });
  }, [articles, activeCategory, activeSources, timeFilter]);

  return (
    <div className="h-screen flex flex-col bg-zinc-950 text-zinc-100 overflow-hidden">
      <Header
        sources={sources}
        loading={loading}
        onRefresh={refresh}
        unreadCount={unreadCount}
        onClearUnread={clearUnread}
      />
      <TickerTape articles={articles} />
      <FilterBar
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        activeSources={activeSources}
        onToggleSource={handleToggleSource}
        timeFilter={timeFilter}
        onTimeFilterChange={setTimeFilter}
      />

      {/* Tools bar */}
      <div className="bg-zinc-950 border-b border-zinc-800 px-2 sm:px-4 py-1.5 flex items-center gap-2 sm:gap-3 shrink-0">
        <SearchBar />
        <AlertsPanel />
        <HeatMap articles={articles} />
      </div>

      {/* Main content area */}
      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        {/* Feed column */}
        <main className="flex-1 overflow-y-auto lg:flex-none lg:w-[65%]">
          {loading && articles.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center gap-3 text-zinc-500">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
                <span className="text-sm font-mono">
                  CHARGEMENT DES FLUX...
                </span>
              </div>
            </div>
          ) : error && articles.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center gap-3 text-red-400">
                <span className="text-sm font-mono">ERREUR: {error}</span>
                <button
                  onClick={refresh}
                  className="text-xs text-emerald-400 hover:underline"
                >
                  Réessayer
                </button>
              </div>
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <span className="text-sm text-zinc-600 font-mono">
                AUCUN ARTICLE POUR CES FILTRES
              </span>
            </div>
          ) : (
            <div>
              {/* Results count */}
              <div className="px-4 py-2 border-b border-zinc-800/50 text-[10px] font-mono text-zinc-600">
                {filteredArticles.length} ARTICLES
                {loading && (
                  <span className="ml-2 text-emerald-500">● SYNCING</span>
                )}
              </div>
              {filteredArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </main>

        {/* Sidebar — below feed on mobile, right column on desktop */}
        <div className="lg:w-[35%] shrink-0 border-t lg:border-t-0 border-zinc-800">
          <Sidebar articles={filteredArticles} sources={sources} />
        </div>
      </div>
    </div>
  );
}
