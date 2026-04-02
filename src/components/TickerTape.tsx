"use client";

import { Article } from "@/types";
import { formatDistanceToNowStrict } from "date-fns";
import { fr } from "date-fns/locale";

interface TickerTapeProps {
  articles: Article[];
}

const categoryColors: Record<string, string> = {
  world: "text-blue-400",
  markets: "text-green-400",
  economy: "text-yellow-400",
  "war-geo": "text-red-400",
  politics: "text-purple-400",
};

export default function TickerTape({ articles }: TickerTapeProps) {
  const latestArticles = articles.slice(0, 30);

  if (latestArticles.length === 0) return null;

  // Duplicate for seamless loop
  const items = [...latestArticles, ...latestArticles];

  return (
    <div className="bg-zinc-900 border-b border-zinc-800 overflow-hidden shrink-0 h-8 flex items-center">
      <div className="flex items-center gap-2 px-2 shrink-0 bg-red-600 h-full z-10">
        <span className="text-white text-xs font-bold tracking-wider">
          LIVE
        </span>
        <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
      </div>
      <div className="overflow-hidden flex-1">
        <div className="flex items-center gap-8 animate-ticker whitespace-nowrap">
          {items.map((article, i) => (
            <a
              key={`${article.id}-${i}`}
              href={article.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs hover:text-white transition-colors shrink-0"
            >
              {article.isBreaking && (
                <span className="bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                  BREAKING
                </span>
              )}
              <span className="text-zinc-600 font-mono">
                {formatDistanceToNowStrict(new Date(article.pubDate), {
                  locale: fr,
                  addSuffix: false,
                })}
              </span>
              <span
                className={`font-medium ${categoryColors[article.category] ?? "text-zinc-300"}`}
              >
                {article.title}
              </span>
              <span className="text-zinc-700">•</span>
              <span className="text-zinc-600 uppercase text-[10px]">
                {article.sourceName}
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
