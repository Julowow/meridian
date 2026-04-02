import { Article } from "@/types";

/**
 * Alert system — monitors articles for keyword matches
 * and sends notifications via Telegram bot.
 *
 * Setup:
 *   1. Set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in .env.local
 *   2. Alerts are checked on each feed refresh
 */

export interface AlertRule {
  id: string;
  keywords: string[];
  enabled: boolean;
  createdAt: string;
}

// In-memory alert rules (move to DB for persistence)
let alertRules: AlertRule[] = [];
const notifiedArticles = new Set<string>();

/**
 * Get all alert rules
 */
export function getAlertRules(): AlertRule[] {
  return alertRules;
}

/**
 * Add a new alert rule
 */
export function addAlertRule(keywords: string[]): AlertRule {
  const rule: AlertRule = {
    id: Math.random().toString(36).substring(2, 10),
    keywords: keywords.map((k) => k.toLowerCase().trim()),
    enabled: true,
    createdAt: new Date().toISOString(),
  };
  alertRules.push(rule);
  return rule;
}

/**
 * Remove an alert rule
 */
export function removeAlertRule(id: string): boolean {
  const before = alertRules.length;
  alertRules = alertRules.filter((r) => r.id !== id);
  return alertRules.length < before;
}

/**
 * Toggle an alert rule on/off
 */
export function toggleAlertRule(id: string): AlertRule | null {
  const rule = alertRules.find((r) => r.id === id);
  if (!rule) return null;
  rule.enabled = !rule.enabled;
  return rule;
}

/**
 * Check articles against alert rules. Returns matching articles.
 */
export function checkAlerts(articles: Article[]): { rule: AlertRule; article: Article }[] {
  const matches: { rule: AlertRule; article: Article }[] = [];

  for (const rule of alertRules) {
    if (!rule.enabled) continue;

    for (const article of articles) {
      // Skip already-notified
      const notifKey = `${rule.id}:${article.id}`;
      if (notifiedArticles.has(notifKey)) continue;

      const searchable = `${article.title} ${article.description}`.toLowerCase();
      const matched = rule.keywords.some((kw) => searchable.includes(kw));

      if (matched) {
        matches.push({ rule, article });
        notifiedArticles.add(notifKey);
      }
    }
  }

  return matches;
}

/**
 * Send a Telegram notification for a matched article.
 * Requires TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID env vars.
 */
export async function sendTelegramAlert(
  article: Article,
  matchedKeywords: string[]
): Promise<boolean> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.warn("Telegram credentials not configured, skipping alert");
    return false;
  }

  const message = [
    `🚨 *MERIDIAN ALERT*`,
    ``,
    `*${article.title}*`,
    ``,
    `📰 ${article.sourceName} — ${article.category.toUpperCase()}`,
    `🔑 Keywords: ${matchedKeywords.join(", ")}`,
    ``,
    `${article.description?.substring(0, 200) ?? ""}...`,
    ``,
    `[Lire l'article](${article.link})`,
  ].join("\n");

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: "Markdown",
          disable_web_page_preview: true,
        }),
      }
    );
    return res.ok;
  } catch (error) {
    console.error("Telegram alert failed:", error);
    return false;
  }
}

/**
 * Process alerts: check articles, send Telegram notifications for matches.
 */
export async function processAlerts(articles: Article[]): Promise<number> {
  const matches = checkAlerts(articles);

  let sent = 0;
  for (const { rule, article } of matches) {
    const success = await sendTelegramAlert(article, rule.keywords);
    if (success) sent++;
  }

  return sent;
}
