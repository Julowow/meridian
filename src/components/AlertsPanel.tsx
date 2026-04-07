"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell, Plus, Trash2, ToggleLeft, ToggleRight, X } from "lucide-react";
import { AlertRule } from "@/lib/alerts";
import { useI18n } from "@/i18n/context";

export default function AlertsPanel() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [newKeywords, setNewKeywords] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchRules = useCallback(async () => {
    try {
      const res = await fetch("/api/alerts");
      const data = await res.json();
      setRules(data.rules ?? []);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (open) fetchRules();
  }, [open, fetchRules]);

  const addRule = async () => {
    if (!newKeywords.trim()) return;
    setLoading(true);
    try {
      const keywords = newKeywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean);
      await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keywords }),
      });
      setNewKeywords("");
      await fetchRules();
    } finally {
      setLoading(false);
    }
  };

  const deleteRule = async (id: string) => {
    await fetch(`/api/alerts?id=${id}`, { method: "DELETE" });
    await fetchRules();
  };

  const toggleRule = async (id: string) => {
    await fetch("/api/alerts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    await fetchRules();
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-800/50 border border-zinc-700/50 hover:border-zinc-600 transition-colors text-xs text-zinc-500"
        title="Alertes Telegram"
      >
        <Bell className="w-3.5 h-3.5" />
        <span className="font-mono">{t.alerts}</span>
        {rules.filter((r) => r.enabled).length > 0 && (
          <span className="bg-amber-500/20 text-amber-400 text-[9px] font-bold px-1 py-0.5 rounded">
            {rules.filter((r) => r.enabled).length}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-400" />
                <h2 className="text-sm font-bold text-zinc-100">
                  {t.alertsTitle}
                </h2>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-zinc-500 hover:text-zinc-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Add rule */}
            <div className="px-4 py-3 border-b border-zinc-800">
              <p className="text-[10px] text-zinc-600 font-mono mb-2">
                {t.alertsAdd}
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newKeywords}
                  onChange={(e) => setNewKeywords(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addRule()}
                  placeholder={t.alertsPlaceholder}
                  className="flex-1 bg-zinc-800 text-sm text-zinc-100 placeholder-zinc-600 px-3 py-1.5 rounded outline-none border border-zinc-700 focus:border-emerald-500/50"
                />
                <button
                  onClick={addRule}
                  disabled={loading || !newKeywords.trim()}
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold px-3 py-1.5 rounded transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {t.alertsAddBtn}
                </button>
              </div>
            </div>

            {/* Rules list */}
            <div className="max-h-[40vh] overflow-y-auto">
              {rules.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-zinc-600 font-mono">
                  {t.alertsNone}
                </div>
              ) : (
                <div className="divide-y divide-zinc-800/50">
                  {rules.map((rule) => (
                    <div
                      key={rule.id}
                      className="flex items-center gap-3 px-4 py-2.5"
                    >
                      <button
                        onClick={() => toggleRule(rule.id)}
                        className={
                          rule.enabled ? "text-emerald-400" : "text-zinc-600"
                        }
                      >
                        {rule.enabled ? (
                          <ToggleRight className="w-5 h-5" />
                        ) : (
                          <ToggleLeft className="w-5 h-5" />
                        )}
                      </button>
                      <div className="flex-1 flex items-center gap-1.5 flex-wrap">
                        {rule.keywords.map((kw) => (
                          <span
                            key={kw}
                            className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                              rule.enabled
                                ? "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                                : "bg-zinc-800 text-zinc-600 border border-zinc-700"
                            }`}
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                      <button
                        onClick={() => deleteRule(rule.id)}
                        className="text-zinc-600 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-zinc-800 text-[10px] text-zinc-600 font-mono">
              {process.env.NEXT_PUBLIC_TELEGRAM_CONFIGURED === "true"
                ? t.alertsTgConnected
                : t.alertsTgNotConfigured}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
