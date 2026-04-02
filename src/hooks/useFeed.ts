"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Article, SourceStatus, FeedResponse } from "@/types";
import { POLLING_INTERVAL_MS } from "@/config/sources";

export function useFeed() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [sources, setSources] = useState<SourceStatus[]>([]);
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const lastSeenRef = useRef<Set<string>>(new Set());

  const fetchFeed = useCallback(async () => {
    try {
      const res = await fetch("/api/feed");
      if (!res.ok) throw new Error("Feed fetch failed");
      const data: FeedResponse = await res.json();

      // Count new articles
      const newIds = data.articles
        .map((a) => a.id)
        .filter((id) => !lastSeenRef.current.has(id));
      if (lastSeenRef.current.size > 0) {
        setUnreadCount((prev) => prev + newIds.length);
      }
      data.articles.forEach((a) => lastSeenRef.current.add(a.id));

      setArticles(data.articles);
      setSources(data.sources);
      setFetchedAt(data.fetchedAt);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(() => {
    setLoading(true);
    fetchFeed();
  }, [fetchFeed]);

  const clearUnread = useCallback(() => {
    setUnreadCount(0);
  }, []);

  useEffect(() => {
    fetchFeed();
    const interval = setInterval(fetchFeed, POLLING_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchFeed]);

  return {
    articles,
    sources,
    fetchedAt,
    loading,
    error,
    refresh,
    unreadCount,
    clearUnread,
  };
}
