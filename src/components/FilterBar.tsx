"use client";

import { Category, SourceId, TimeFilter } from "@/types";
import { RSS_SOURCES } from "@/config/sources";
import { useI18n } from "@/i18n/context";

interface FilterBarProps {
  activeCategory: Category;
  onCategoryChange: (cat: Category) => void;
  activeSources: Set<SourceId>;
  onToggleSource: (id: SourceId) => void;
  timeFilter: TimeFilter;
  onTimeFilterChange: (tf: TimeFilter) => void;
}

const CATEGORY_IDS = ["all", "world", "markets", "economy", "war-geo", "politics"];

export default function FilterBar({
  activeCategory,
  onCategoryChange,
  activeSources,
  onToggleSource,
  timeFilter,
  onTimeFilterChange,
}: FilterBarProps) {
  const { t } = useI18n();

  return (
    <div className="bg-zinc-950 border-b border-zinc-800 px-2 sm:px-4 py-2 flex flex-wrap items-center gap-2 sm:gap-4 shrink-0">
      {/* Category tabs */}
      <div className="flex items-center gap-1 overflow-x-auto">
        {CATEGORY_IDS.map((id) => (
          <button
            key={id}
            onClick={() => onCategoryChange(id as Category)}
            className={`px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-bold tracking-wider rounded transition-colors whitespace-nowrap ${
              activeCategory === id
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
            }`}
          >
            {t.categories[id] ?? id.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Time filter */}
      <div className="flex items-center gap-1 ml-auto sm:ml-0">
        <div className="w-px h-4 bg-zinc-800 hidden sm:block" />
        {(["1h", "6h", "24h"] as TimeFilter[]).map((tf) => (
          <button
            key={tf}
            onClick={() => onTimeFilterChange(tf)}
            className={`px-2 py-0.5 text-[10px] sm:text-xs font-mono rounded transition-colors ${
              timeFilter === tf
                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {tf}
          </button>
        ))}
      </div>

      {/* Source toggles */}
      <div className="hidden md:flex items-center gap-1.5">
        <div className="w-px h-4 bg-zinc-800" />
        {RSS_SOURCES.map((source) => (
          <button
            key={source.id}
            onClick={() => onToggleSource(source.id)}
            className={`px-2 py-0.5 text-[10px] font-mono rounded transition-all whitespace-nowrap ${
              activeSources.has(source.id)
                ? "bg-zinc-700 text-zinc-200 border border-zinc-600"
                : "text-zinc-600 border border-zinc-800 hover:border-zinc-700"
            }`}
          >
            {source.name}
          </button>
        ))}
      </div>
    </div>
  );
}
