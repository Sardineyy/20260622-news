import Parser from "rss-parser";

export interface NewsArticle {
  title: string;
  link: string;
  pubDate: string;
  source: string;
  snippet: string;
}

const parser = new Parser({
  customFields: {
    item: [["source", "source"]],
  },
});

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

function isWithinLast7Days(dateStr: string): boolean {
  const pubDate = new Date(dateStr);
  if (isNaN(pubDate.getTime())) return true;
  return Date.now() - pubDate.getTime() <= SEVEN_DAYS_MS;
}

function extractSource(item: Record<string, unknown>): string {
  const source = item.source as { _: string } | string | undefined;
  if (typeof source === "object" && source?._) return source._;
  if (typeof source === "string") return source;
  return "Unknown";
}

export async function fetchRecentNews(keyword: string): Promise<NewsArticle[]> {
  const encodedKeyword = encodeURIComponent(keyword);
  const url = `https://news.google.com/rss/search?q=${encodedKeyword}+AI&hl=ko&gl=KR&ceid=KR:ko&when=7d`;

  try {
    const feed = await parser.parseURL(url);
    const articles: NewsArticle[] = [];

    for (const item of feed.items ?? []) {
      if (!item.title || !item.link) continue;
      if (!isWithinLast7Days(item.pubDate ?? "")) continue;

      articles.push({
        title: item.title,
        link: item.link,
        pubDate: item.pubDate ?? new Date().toISOString(),
        source: extractSource(item as unknown as Record<string, unknown>),
        snippet: item.contentSnippet ?? item.content ?? "",
      });
    }

    return articles.slice(0, 15);
  } catch (error) {
    console.error("News fetch error:", error);
    throw new Error("뉴스 수집 중 오류가 발생했습니다.");
  }
}
