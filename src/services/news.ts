import { INTEREST_BY_ID, type InterestId } from '@/constants/interests';
import { DEMO_NEWS } from '@/data/demo';
import { buildUrl, fetchJson } from '@/lib/api';
import type { FeedResult, NewsArticle } from '@/types/models';

type NewsApiResponse = {
  articles?: {
    title?: string;
    description?: string | null;
    url?: string;
    source?: { name?: string };
    urlToImage?: string | null;
    publishedAt?: string;
  }[];
};

function demoFor(interests: InterestId[]): NewsArticle[] {
  return DEMO_NEWS.filter((article) => interests.includes(article.interest));
}

export async function fetchNews(interests: InterestId[]): Promise<FeedResult<NewsArticle>> {
  const apiKey = process.env.EXPO_PUBLIC_NEWSAPI_KEY?.trim();

  if (!apiKey || interests.length === 0) {
    return {
      items: demoFor(interests),
      isDemo: true,
      notice: 'Sample stories — add EXPO_PUBLIC_NEWSAPI_KEY for live news.',
    };
  }

  const query = interests
    .slice(0, 4)
    .map((id) => `(${INTEREST_BY_ID[id].newsQuery})`)
    .join(' OR ');

  try {
    const data = await fetchJson<NewsApiResponse>(
      buildUrl('https://newsapi.org/v2/everything', {
        q: query,
        language: 'en',
        sortBy: 'publishedAt',
        pageSize: 20,
        apiKey,
      }),
    );

    const seen = new Set<string>();
    const items = (data.articles ?? [])
      .filter((article) => article.title && article.url)
      .map((article, index): NewsArticle => {
        const sourceName = article.source?.name ?? 'Unknown source';
        const matchingInterest =
          interests.find((id) =>
            INTEREST_BY_ID[id].newsQuery
              .toLowerCase()
              .split(' or ')
              .some((term) => sourceName.toLowerCase().includes(term.replace(/"/g, ''))),
          ) ?? interests[index % interests.length];

        return {
          id: article.url!,
          title: article.title!.trim(),
          description: (article.description ?? '').trim(),
          url: article.url!,
          source: sourceName,
          imageUrl: article.urlToImage ?? null,
          publishedAt: article.publishedAt ?? new Date().toISOString(),
          interest: matchingInterest,
        };
      })
      .filter((article) => {
        if (seen.has(article.url)) return false;
        seen.add(article.url);
        return true;
      });

    if (items.length === 0) {
      return {
        items: demoFor(interests),
        isDemo: true,
        notice: 'No live stories matched — showing sample stories.',
      };
    }

    return { items, isDemo: false };
  } catch {
    return {
      items: demoFor(interests),
      isDemo: true,
      notice: 'Live news unavailable — showing sample stories.',
    };
  }
}
