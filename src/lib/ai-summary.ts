import Anthropic from "@anthropic-ai/sdk";
import { Article } from "@/types";

/**
 * AI Summary module powered by Claude Haiku.
 * Cost: ~$0.001 per article
 *
 * Requires ANTHROPIC_API_KEY in .env.local
 */

export interface AISummaryResult {
  summary: string;
  entities: string[];
  sentiment: "positive" | "neutral" | "negative" | "alarming";
}

// In-memory cache to avoid re-summarizing the same articles
const summaryCache = new Map<string, AISummaryResult>();

let client: Anthropic | null = null;

function getClient(): Anthropic | null {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  if (!client) {
    client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
      timeout: 30_000, // 30s timeout
    });
  }
  return client;
}

/**
 * Generate AI summary for a single article using Claude Haiku.
 */
export async function generateSummary(
  article: Article
): Promise<AISummaryResult | null> {
  // Check cache
  if (summaryCache.has(article.id)) {
    return summaryCache.get(article.id)!;
  }

  const anthropic = getClient();
  if (!anthropic) return null;

  try {
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 300,
      messages: [
        {
          role: "user",
          content: `Analyse cet article de presse et retourne UNIQUEMENT du JSON valide, sans texte autour.

Titre: ${article.title}
Source: ${article.sourceName}
Contenu: ${article.description?.substring(0, 500) ?? "N/A"}

Format JSON attendu:
{
  "summary": "Résumé en 2 phrases courtes en français",
  "entities": ["entité1", "entité2", "entité3"],
  "sentiment": "positive|neutral|negative|alarming"
}

Règles:
- summary: 2 phrases max, en français, concis et factuel
- entities: max 5 entités clés (pays, personnes, organisations)
- sentiment: "alarming" si crise/guerre/catastrophe, "negative" si mauvaise nouvelle économique/politique, "positive" si bonne nouvelle, "neutral" sinon`,
        },
      ],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";

    // Extract JSON from response (handles cases where model adds markdown)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]) as AISummaryResult;

    // Validate
    if (!parsed.summary || !parsed.entities || !parsed.sentiment) return null;

    // Ensure sentiment is valid
    const validSentiments = ["positive", "neutral", "negative", "alarming"];
    if (!validSentiments.includes(parsed.sentiment)) {
      parsed.sentiment = "neutral";
    }

    // Cache result
    summaryCache.set(article.id, parsed);

    return parsed;
  } catch (error) {
    console.error(`AI summary failed for "${article.title}":`, error);
    return null;
  }
}

/**
 * Batch process articles for AI summaries.
 * Processes up to 10 articles per batch to avoid rate limits.
 * Skips articles that already have summaries.
 */
export async function enrichArticlesWithAI(
  articles: Article[]
): Promise<Article[]> {
  const anthropic = getClient();
  if (!anthropic) return articles;

  // Only summarize articles that don't have summaries yet, limit to 10 per batch
  const toSummarize = articles
    .filter(
      (a) =>
        (a.aiSummary === undefined || a.aiSummary === null) &&
        !summaryCache.has(a.id)
    )
    .slice(0, 10);

  // Process in parallel with concurrency limit of 3
  const CONCURRENCY = 3;
  for (let i = 0; i < toSummarize.length; i += CONCURRENCY) {
    const batch = toSummarize.slice(i, i + CONCURRENCY);
    await Promise.allSettled(batch.map((article) => generateSummary(article)));
  }

  // Apply cached summaries to all articles
  return articles.map((article) => {
    const cached = summaryCache.get(article.id);
    if (cached) {
      return {
        ...article,
        aiSummary: cached.summary,
        aiEntities: cached.entities,
        aiSentiment: cached.sentiment,
      };
    }
    return article;
  });
}
