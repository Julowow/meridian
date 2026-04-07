export type Locale = "fr" | "en";

export const translations = {
  fr: {
    // Header
    liveIntel: "VEILLE EN DIRECT",
    utc: "UTC",
    local: "LOCAL",
    refreshFeeds: "Rafraîchir les flux",

    // Filter bar
    categories: {
      all: "TOUT",
      world: "MONDE",
      markets: "MARCHÉS",
      economy: "ÉCONOMIE",
      "war-geo": "GUERRE & GÉO",
      politics: "POLITIQUE",
    } as Record<string, string>,

    // Tools
    search: "Rechercher...",
    searchPlaceholder: "Rechercher dans les articles des dernières 48h...",
    searchClose: "fermer",
    searchFulltext: "Recherche fulltext sur titre + description + source",
    noResults: "AUCUN RÉSULTAT POUR",
    results: "RÉSULTAT",
    resultsPlural: "RÉSULTATS",

    alerts: "Alertes",
    alertsTitle: "ALERTES TELEGRAM",
    alertsAdd: "AJOUTER UNE ALERTE (mots-clés séparés par des virgules)",
    alertsPlaceholder: "Fed, Ukraine, Bitcoin, élection...",
    alertsAddBtn: "AJOUTER",
    alertsNone: "AUCUNE ALERTE CONFIGURÉE",
    alertsTgConnected: "Telegram connecté — notifications en temps réel",
    alertsTgNotConfigured: "Telegram non configuré — définir TELEGRAM_BOT_TOKEN et TELEGRAM_CHAT_ID",

    heatmap: "Heatmap",
    heatmapTitle: "HEATMAP GÉOGRAPHIQUE",
    heatmapZones: "ZONES ACTIVES",

    // Feed
    articles: "ARTICLES",
    syncing: "SYNCING",
    loading: "CHARGEMENT DES FLUX...",
    error: "ERREUR",
    retry: "Réessayer",
    noArticles: "AUCUN ARTICLE POUR CES FILTRES",

    // Article card
    ago: "il y a",
    sources: "sources",
    readArticle: "Lire l'article source",
    aiSummary: "RÉSUMÉ IA",
    aiUnavailable: "RÉSUMÉ IA NON DISPONIBLE",
    coveredBy: "Aussi couvert par:",

    // Sidebar
    latest: "LATEST",
    breakdown: "BREAKDOWN",
    sourcesTitle: "SOURCES",
    totalArticles: "TOTAL ARTICLES",
    multiSource: "MULTI-SOURCE",
    aiSummaries: "RÉSUMÉS IA",

    // Category labels (for cards & sidebar)
    categoryLabels: {
      world: "MONDE",
      markets: "MARCHÉS",
      economy: "ÉCONOMIE",
      "war-geo": "GUERRE",
      politics: "POLITIQUE",
    } as Record<string, string>,
    categoryLabelsFull: {
      world: "MONDE",
      markets: "MARCHÉS",
      economy: "ÉCONOMIE",
      "war-geo": "GUERRE & GÉO",
      politics: "POLITIQUE",
    } as Record<string, string>,
  },

  en: {
    liveIntel: "LIVE INTEL",
    utc: "UTC",
    local: "LOCAL",
    refreshFeeds: "Refresh feeds",

    categories: {
      all: "ALL",
      world: "WORLD",
      markets: "MARKETS",
      economy: "ECONOMY",
      "war-geo": "WAR & GEO",
      politics: "POLITICS",
    } as Record<string, string>,

    search: "Search...",
    searchPlaceholder: "Search articles from the last 48h...",
    searchClose: "close",
    searchFulltext: "Fulltext search on title + description + source",
    noResults: "NO RESULTS FOR",
    results: "RESULT",
    resultsPlural: "RESULTS",

    alerts: "Alerts",
    alertsTitle: "TELEGRAM ALERTS",
    alertsAdd: "ADD AN ALERT (comma-separated keywords)",
    alertsPlaceholder: "Fed, Ukraine, Bitcoin, election...",
    alertsAddBtn: "ADD",
    alertsNone: "NO ALERTS CONFIGURED",
    alertsTgConnected: "Telegram connected — real-time notifications",
    alertsTgNotConfigured: "Telegram not configured — set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID",

    heatmap: "Heatmap",
    heatmapTitle: "GEOGRAPHIC HEATMAP",
    heatmapZones: "ACTIVE ZONES",

    articles: "ARTICLES",
    syncing: "SYNCING",
    loading: "LOADING FEEDS...",
    error: "ERROR",
    retry: "Retry",
    noArticles: "NO ARTICLES FOR THESE FILTERS",

    ago: "",
    sources: "sources",
    readArticle: "Read source article",
    aiSummary: "AI SUMMARY",
    aiUnavailable: "AI SUMMARY UNAVAILABLE",
    coveredBy: "Also covered by:",

    latest: "LATEST",
    breakdown: "BREAKDOWN",
    sourcesTitle: "SOURCES",
    totalArticles: "TOTAL ARTICLES",
    multiSource: "MULTI-SOURCE",
    aiSummaries: "AI SUMMARIES",

    categoryLabels: {
      world: "WORLD",
      markets: "MARKETS",
      economy: "ECONOMY",
      "war-geo": "WAR",
      politics: "POLITICS",
    } as Record<string, string>,
    categoryLabelsFull: {
      world: "WORLD",
      markets: "MARKETS",
      economy: "ECONOMY",
      "war-geo": "WAR & GEO",
      politics: "POLITICS",
    } as Record<string, string>,
  },
};

export type Translations = (typeof translations)["fr"];
