"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { Article } from "@/types";
import ArticleCard from "./ArticleCard";

export default function SearchBar() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Keyboard shortcut: Ctrl+K to open
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") {
        setOpen(false);
        setQuery("");
        setResults([]);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setTotal(0);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.results ?? []);
      setTotal(data.total ?? 0);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInput = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(value), 300);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1 rounded bg-zinc-800/50 border border-zinc-700/50 hover:border-zinc-600 transition-colors text-xs text-zinc-500"
      >
        <Search className="w-3.5 h-3.5" />
        <span className="font-mono hidden sm:inline">Rechercher...</span>
        <kbd className="text-[9px] bg-zinc-700 px-1 py-0.5 rounded hidden md:inline">
          Ctrl+K
        </kbd>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => {
          setOpen(false);
          setQuery("");
          setResults([]);
        }}
      />

      {/* Search panel */}
      <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl overflow-hidden">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800">
          <Search className="w-4 h-4 text-zinc-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleInput(e.target.value)}
            placeholder="Rechercher dans les articles des dernières 48h..."
            className="flex-1 bg-transparent text-sm text-zinc-100 placeholder-zinc-600 outline-none"
          />
          {loading && <Loader2 className="w-4 h-4 text-emerald-400 animate-spin shrink-0" />}
          <button
            onClick={() => {
              setOpen(false);
              setQuery("");
              setResults([]);
            }}
            className="text-zinc-500 hover:text-zinc-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto">
          {query && !loading && results.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-zinc-600 font-mono">
              AUCUN RÉSULTAT POUR &quot;{query}&quot;
            </div>
          )}
          {total > 0 && (
            <div className="px-4 py-1.5 text-[10px] font-mono text-zinc-600 border-b border-zinc-800/50">
              {total} RÉSULTAT{total > 1 ? "S" : ""}
            </div>
          )}
          {results.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>

        {/* Footer hint */}
        <div className="px-4 py-2 border-t border-zinc-800 text-[10px] text-zinc-600 font-mono flex items-center gap-4">
          <span>
            <kbd className="bg-zinc-800 px-1 py-0.5 rounded">ESC</kbd> fermer
          </span>
          <span>Recherche fulltext sur titre + description + source</span>
        </div>
      </div>
    </div>
  );
}
