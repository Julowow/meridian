"use client";

import { useState } from "react";
import { Article } from "@/types";
import { formatDistanceToNowStrict } from "date-fns";
import { fr } from "date-fns/locale";
import { ExternalLink, ChevronDown, ChevronUp } from "lucide-react";

interface ArticleCardProps {
  article: Article;
}

const categoryBadgeColors: Record<string, string> = {
  world: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  markets: "bg-green-500/15 text-green-400 border-green-500/20",
  economy: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
  "war-geo": "bg-red-500/15 text-red-400 border-red-500/20",
  politics: "bg-purple-500/15 text-purple-400 border-purple-500/20",
};

const categoryLabels: Record<string, string> = {
  world: "MONDE",
  markets: "MARCHÉS",
  economy: "ÉCONOMIE",
  "war-geo": "GUERRE",
  politics: "POLITIQUE",
};

export default function ArticleCard({ article }: ArticleCardProps) {
  const [expanded, setExpanded] = useState(false);

  const timeAgo = formatDistanceToNowStrict(new Date(article.pubDate), {
    locale: fr,
    addSuffix: false,
  });

  return (
    <div
      className={`group border-b border-zinc-800/50 px-4 py-3 hover:bg-zinc-800/30 transition-colors cursor-pointer ${
        article.isBreaking ? "border-l-2 border-l-red-500 bg-red-950/10" : ""
      }`}
      onClick={() => setExpanded(!expanded)}
    >
      {/* Top row: badges + time + source */}
      <div className="flex items-center gap-2 mb-1.5">
        {article.isBreaking && (
          <span className="bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded animate-pulse">
            BREAKING
          </span>
        )}
        {article.isHot && (
          <span className="bg-orange-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
            HOT
          </span>
        )}
        <span
          className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${categoryBadgeColors[article.category] ?? "bg-zinc-800 text-zinc-400 border-zinc-700"}`}
        >
          {categoryLabels[article.category] ?? article.category.toUpperCase()}
        </span>
        <span className="text-zinc-600 text-[10px] font-mono uppercase">
          {article.sourceName}
        </span>
        <span className="text-zinc-700 text-[10px]">•</span>
        <span className="text-zinc-500 text-[10px] font-mono">
          il y a {timeAgo}
        </span>
        <div className="flex-1" />
        <span className="text-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity">
          {expanded ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-sm font-semibold text-zinc-100 leading-tight mb-1 group-hover:text-white">
        {article.title}
      </h3>

      {/* Description preview */}
      {!expanded && article.description && (
        <p className="text-xs text-zinc-500 line-clamp-1 leading-relaxed">
          {article.description.substring(0, 200)}
        </p>
      )}

      {/* Expanded content */}
      {expanded && (
        <div className="mt-2 space-y-2">
          <p className="text-xs text-zinc-400 leading-relaxed">
            {article.description}
          </p>
          <a
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            Lire l&apos;article source
          </a>
        </div>
      )}
    </div>
  );
}
