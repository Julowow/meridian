"use client";

import { useState, useEffect } from "react";
import {
  RefreshCw,
  Activity,
  Bell,
  Satellite,
} from "lucide-react";
import { SourceStatus } from "@/types";

interface HeaderProps {
  sources: SourceStatus[];
  loading: boolean;
  onRefresh: () => void;
  unreadCount: number;
  onClearUnread: () => void;
}

function Clock() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const utc = now.toUTCString().slice(17, 25);
  const local = now.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <div className="flex items-center gap-3 font-mono text-sm">
      <span className="text-zinc-400">UTC</span>
      <span className="text-emerald-400 font-bold">{utc}</span>
      <span className="text-zinc-600">|</span>
      <span className="text-zinc-400">LOCAL</span>
      <span className="text-emerald-400 font-bold">{local}</span>
    </div>
  );
}

export default function Header({
  sources,
  loading,
  onRefresh,
  unreadCount,
  onClearUnread,
}: HeaderProps) {
  const onlineCount = sources.filter((s) => s.online).length;
  const totalCount = sources.length;

  return (
    <header className="bg-zinc-950 border-b border-zinc-800 px-4 py-2 flex items-center justify-between shrink-0">
      {/* Left: Logo + Name */}
      <div className="flex items-center gap-3">
        <Satellite className="w-6 h-6 text-emerald-400" />
        <h1 className="text-lg font-bold tracking-wider text-white">
          MERIDIAN
        </h1>
        <span className="text-[10px] text-zinc-500 font-mono mt-1">
          LIVE INTEL
        </span>
      </div>

      {/* Center: Clock */}
      <Clock />

      {/* Right: Status + Actions */}
      <div className="flex items-center gap-4">
        {/* Source status */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <Activity className="w-3.5 h-3.5 text-zinc-400" />
          <div className="flex gap-1">
            {sources.map((s) => (
              <div
                key={s.id}
                title={`${s.name}: ${s.online ? "online" : "offline"} (${s.articleCount} articles)`}
                className={`w-2 h-2 rounded-full ${s.online ? "bg-emerald-400" : "bg-red-500"}`}
              />
            ))}
          </div>
          <span className="text-zinc-500">
            {onlineCount}/{totalCount}
          </span>
        </div>

        {/* Unread badge */}
        {unreadCount > 0 && (
          <button
            onClick={onClearUnread}
            className="relative flex items-center gap-1 text-xs font-mono text-amber-400 hover:text-amber-300 transition-colors"
          >
            <Bell className="w-4 h-4" />
            <span className="bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          </button>
        )}

        {/* Refresh */}
        <button
          onClick={onRefresh}
          disabled={loading}
          className="p-1.5 rounded hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-white disabled:opacity-50"
          title="Refresh feeds"
        >
          <RefreshCw
            className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
          />
        </button>
      </div>
    </header>
  );
}
