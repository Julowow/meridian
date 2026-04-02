import { Article } from "@/types";

export interface GeoPoint {
  country: string;
  code: string;
  lat: number;
  lng: number;
  count: number;
  articles: { title: string; source: string }[];
}

// Country detection keywords → coordinates
const COUNTRY_MAP: {
  keywords: string[];
  country: string;
  code: string;
  lat: number;
  lng: number;
}[] = [
  { keywords: ["ukraine", "kyiv", "kiev", "donetsk", "crimea", "kharkiv", "zaporizhzhia"], country: "Ukraine", code: "UA", lat: 49, lng: 32 },
  { keywords: ["russia", "moscow", "kremlin", "putin"], country: "Russie", code: "RU", lat: 56, lng: 38 },
  { keywords: ["china", "beijing", "shanghai", "xi jinping", "chinese"], country: "Chine", code: "CN", lat: 35, lng: 105 },
  { keywords: ["united states", "u.s.", "us ", "america", "washington", "biden", "trump", "congress", "white house", "pentagon", "wall street", "fed "], country: "États-Unis", code: "US", lat: 39, lng: -98 },
  { keywords: ["uk ", "britain", "london", "british", "england", "parliament"], country: "Royaume-Uni", code: "GB", lat: 54, lng: -2 },
  { keywords: ["france", "paris", "macron", "french", "élysée"], country: "France", code: "FR", lat: 47, lng: 2 },
  { keywords: ["germany", "berlin", "german", "bundesbank"], country: "Allemagne", code: "DE", lat: 51, lng: 10 },
  { keywords: ["japan", "tokyo", "japanese", "yen"], country: "Japon", code: "JP", lat: 36, lng: 138 },
  { keywords: ["india", "delhi", "mumbai", "modi", "indian"], country: "Inde", code: "IN", lat: 22, lng: 78 },
  { keywords: ["israel", "tel aviv", "jerusalem", "netanyahu", "israeli"], country: "Israël", code: "IL", lat: 31.5, lng: 35 },
  { keywords: ["palestine", "gaza", "hamas", "west bank", "palestinian"], country: "Palestine", code: "PS", lat: 31.5, lng: 34.5 },
  { keywords: ["iran", "tehran", "iranian"], country: "Iran", code: "IR", lat: 33, lng: 53 },
  { keywords: ["turkey", "ankara", "istanbul", "turkish", "erdogan"], country: "Turquie", code: "TR", lat: 39, lng: 35 },
  { keywords: ["brazil", "brasilia", "brazilian", "lula"], country: "Brésil", code: "BR", lat: -10, lng: -55 },
  { keywords: ["south korea", "seoul", "korean"], country: "Corée du Sud", code: "KR", lat: 36, lng: 128 },
  { keywords: ["north korea", "pyongyang", "kim jong"], country: "Corée du Nord", code: "KP", lat: 40, lng: 127 },
  { keywords: ["taiwan", "taipei", "taiwanese"], country: "Taïwan", code: "TW", lat: 23.5, lng: 121 },
  { keywords: ["saudi", "riyadh"], country: "Arabie Saoudite", code: "SA", lat: 24, lng: 45 },
  { keywords: ["australia", "sydney", "australian", "canberra"], country: "Australie", code: "AU", lat: -25, lng: 135 },
  { keywords: ["canada", "ottawa", "toronto", "canadian"], country: "Canada", code: "CA", lat: 56, lng: -96 },
  { keywords: ["sudan", "khartoum", "sudanese"], country: "Soudan", code: "SD", lat: 15, lng: 30 },
  { keywords: ["nigeria", "lagos", "nigerian"], country: "Nigéria", code: "NG", lat: 10, lng: 8 },
  { keywords: ["south africa", "cape town", "johannesburg"], country: "Afrique du Sud", code: "ZA", lat: -30, lng: 25 },
  { keywords: ["egypt", "cairo", "egyptian"], country: "Égypte", code: "EG", lat: 27, lng: 30 },
  { keywords: ["mexico", "mexico city", "mexican"], country: "Mexique", code: "MX", lat: 23, lng: -102 },
  { keywords: ["pakistan", "islamabad", "karachi", "pakistani"], country: "Pakistan", code: "PK", lat: 30, lng: 70 },
  { keywords: ["eu ", "european union", "brussels", "ecb", "eurozone"], country: "Union Européenne", code: "EU", lat: 50.8, lng: 4.4 },
  { keywords: ["opec"], country: "OPEC (Vienne)", code: "OPEC", lat: 48.2, lng: 16.4 },
  { keywords: ["nato"], country: "OTAN (Bruxelles)", code: "NATO", lat: 50.9, lng: 4.4 },
];

/**
 * Extract geographic references from articles
 */
export function extractGeoData(articles: Article[]): GeoPoint[] {
  const geoMap = new Map<string, GeoPoint>();

  for (const article of articles) {
    const text = `${article.title} ${article.description ?? ""}`.toLowerCase();

    for (const entry of COUNTRY_MAP) {
      const matched = entry.keywords.some((kw) => text.includes(kw));
      if (!matched) continue;

      const existing = geoMap.get(entry.code);
      if (existing) {
        existing.count++;
        if (existing.articles.length < 5) {
          existing.articles.push({
            title: article.title,
            source: article.sourceName,
          });
        }
      } else {
        geoMap.set(entry.code, {
          country: entry.country,
          code: entry.code,
          lat: entry.lat,
          lng: entry.lng,
          count: 1,
          articles: [{ title: article.title, source: article.sourceName }],
        });
      }
    }
  }

  return Array.from(geoMap.values()).sort((a, b) => b.count - a.count);
}
