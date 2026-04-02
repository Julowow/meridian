import { Article } from "@/types";

/**
 * AI Summary module — placeholder for Claude Haiku integration.
 *
 * To activate:
 *   1. Set ANTHROPIC_API_KEY in .env.local
 *   2. npm install @anthropic-ai/sdk
 *   3. Uncomment the real implementation below and remove the placeholder
 *
 * Cost estimate: ~$0.001 per article with Haiku
 * Rate: can process ~50 articles/minute
 */

export interface AISummaryResult {
  summary: string;         // 2-line summary
  entities: string[];      // Key entities: countries, people, orgs
  sentiment: "positive" | "neutral" | "negative" | "alarming";
}

/**
 * Generate AI summary for a single article.
 * Currently returns null (placeholder).
 */
export async function generateSummary(
  _article: Article
): Promise<AISummaryResult | null> {
  // ──────────────────────────────────────────────────
  // PLACEHOLDER — Replace with real Haiku call:
  //
  // import Anthropic from "@anthropic-ai/sdk";
  // const client = new Anthropic();
  //
  // const response = await client.messages.create({
  //   model: "claude-haiku-4-5-20251001",
  //   max_tokens: 200,
  //   messages: [{
  //     role: "user",
  //     content: `Analyze this news article and return JSON:
  //       Title: ${article.title}
  //       Content: ${article.description}
  //
  //       Return: { "summary": "2 sentence summary", "entities": ["entity1", ...], "sentiment": "positive|neutral|negative|alarming" }`
  //   }],
  // });
  //
  // return JSON.parse(response.content[0].text);
  // ──────────────────────────────────────────────────

  return null;
}

/**
 * Batch process articles for AI summaries.
 * Skips articles that already have summaries.
 */
export async function enrichArticlesWithAI(
  articles: Article[]
): Promise<Article[]> {
  return Promise.all(
    articles.map(async (article) => {
      if (article.aiSummary !== undefined && article.aiSummary !== null) {
        return article;
      }

      const result = await generateSummary(article);
      if (!result) return article;

      return {
        ...article,
        aiSummary: result.summary,
        aiEntities: result.entities,
        aiSentiment: result.sentiment,
      };
    })
  );
}
