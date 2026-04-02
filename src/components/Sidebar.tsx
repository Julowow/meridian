"use client";

import { Article, SourceStatus } from "@/types";
import { formatDistanceToNowStrict } from "date-fns";
import { fr } from "date-fns/locale";
import { ExternalLink } from "lucide-react";

interface SidebarProps {
  articles: Article[];
  sources: SourceStatus[];
}

const categoryLabels: Record<string, string> = {
  world: "MONDE",
  markets: "MARCHÉS",
  economy: "ÉCONOMIE",
  "war-geo": "GUERRE & GÉO",
  politics: "POLITIQUE",
};

const categoryBarColors: Record<string, string> = {
  world: "bg-blue-500",
  markets: "bg-green-500",
  economy: "bg-yellow-500",
  "war-geo": "bg-red-500",
  politics: "bg-purple-500",
};

export default function Sidebar({ articles, sources }: SidebarProps) {
  const latest = articles.slice(0, 10);

  // Category breakdown
  const breakdown = new Map<string, number>();
  for (const article of articles) {
    breakdown.set(article.category, (breakdown.get(article.category) ?? 0) + 1);
  }
  const maxCount = Math.max(...breakdown.values(), 1);

  // Phase 2 stats
  const dedupedCount = articles.filter((a) => (a.duplicateCount ?? 1) > 1).length;
  const aiCount = articles.filter((a) => a.aiSummary).length;

  return (
    <aside className="w-full h-full overflow-y-auto bg-zinc-950 border-l border-zinc-800">
      {/* LATEST section */}
      <div className="p-3 border-b border-zinc-800">
        <h2 className="text-[11px] font-bold text-zinc-400 tracking-widest mb-3 flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          LATEST
        </h2>
        <div className="space-y-0.5">
          {latest.map((article) => (
            <a
              key={article.id}
              href={article.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-2 py-1.5 hover:bg-zinc-800/50 rounded px-1.5 -mx-1.5 transition-colors"
            >
              <span className="text-zinc-700 text-[10px] font-mono mt-0.5 shrink-0 w-10">
                {formatDistanceToNowStrict(new Date(article.pubDate), {
                  locale: fr,
                  addSuffix: false,
                })}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-zinc-300 leading-tight group-hover:text-white transition-colors line-clamp-2">
                  {article.isBreaking && (
                    <span className="text-red-400 font-bold mr-1">●</span>
                  )}
                  {article.title}
                </p>
                <span className="text-[9px] text-zinc-600 font-mono uppercase">
                  {article.sourceName}
                </span>
              </div>
              <ExternalLink className="w-3 h-3 text-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5 shrink-0" />
            </a>
          ))}
        </div>
      </div>

      {/* BREAKDOWN section */}
      <div className="p-3 border-b border-zinc-800">
        <h2 className="text-[11px] font-bold text-zinc-400 tracking-widest mb-3">
          BREAKDOWN
        </h2>
        <div className="space-y-2">
          {[...breakdown.entries()]
            .sort((a, b) => b[1] - a[1])
            .map(([cat, count]) => (
              <div key={cat}>
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {categoryLabels[cat] ?? cat.toUpperCase()}
                  </span>
                  <span className="text-[10px] text-zinc-600 font-mono">
                    {count}
                  </span>
                </div>
                <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${categoryBarColors[cat] ?? "bg-zinc-500"}`}
                    style={{ width: `${(count / maxCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* SOURCES section */}
      <div className="p-3">
        <h2 className="text-[11px] font-bold text-zinc-400 tracking-widest mb-3">
          SOURCES
        </h2>
        <div className="space-y-1.5">
          {sources.map((source) => (
            <div
              key={source.id}
              className="flex items-center gap-2 text-[11px]"
            >
              <span
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${source.online ? "bg-emerald-400" : "bg-red-500"}`}
              />
              <span className="text-zinc-400 flex-1 truncate">
                {source.name}
              </span>
              <span className="text-zinc-600 font-mono">
                {source.articleCount}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-2 border-t border-zinc-800/50 space-y-1">
          <div className="flex items-center justify-between text-[10px] text-zinc-600 font-mono">
            <span>TOTAL ARTICLES</span>
            <span className="text-zinc-400 font-bold">
              {articles.length}
            </span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-zinc-600 font-mono">
            <span>MULTI-SOURCE</span>
            <span className="text-amber-400 font-bold">
              {dedupedCount}
            </span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-zinc-600 font-mono">
            <span>RÉSUMÉS IA</span>
            <span className="text-violet-400 font-bold">
              {aiCount}/{articles.length}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
