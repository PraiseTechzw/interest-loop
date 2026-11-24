import { buildUrl, fetchJson } from '@/lib/api';
import { getInterest } from '@/lib/interest-catalogue';
import type { FeedResult, NewsArticle } from '@/types/models';

import { fetchFreeNews } from './free-news';

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

async function fetchNewsApi(interests: string[]): Promise<FeedResult<NewsArticle>> {
  const apiKey = process.env.EXPO_PUBLIC_NEWSAPI_KEY?.trim();

  if (!apiKey || interests.length === 0) {
    return { items: [] };
  }

  const query = interests
    .slice(0, 4)
    .map((id) => `(${getInterest(id).newsQuery})`)
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
        const haystack =
          `${article.title ?? ''} ${article.description ?? ''} ${sourceName}`.toLowerCase();
        const matchingInterest =
          interests.find((id) =>
            getInterest(id).newsQuery
              .toLowerCase()
              .split(/\s+or\s+/)
              .map((term) => term.replace(/[()"]/g, '').trim())
              .filter(Boolean)
              .some((term) => haystack.includes(term)),
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

    return { items };
  } catch {
    return { items: [], notice: 'NewsAPI unavailable.' };
  }
}

/** Merge both live sources, dropping duplicates and keeping the newest stories first. */
function mergeSources(sources: FeedResult<NewsArticle>[]): NewsArticle[] {
  const seen = new Set<string>();
  return sources
    .flatMap((source) => source.items)
    .filter((article) => {
      if (seen.has(article.url)) return false;
      seen.add(article.url);
      return true;
    })
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
    .slice(0, 30);
}

export async function fetchNews(interests: string[]): Promise<FeedResult<NewsArticle>> {
  const hasNewsApiKey = Boolean(process.env.EXPO_PUBLIC_NEWSAPI_KEY?.trim());
  const hasFreeNewsKey = Boolean(process.env.EXPO_PUBLIC_FREENEWS_KEY?.trim());

  if (!hasNewsApiKey && !hasFreeNewsKey) {
    return {
      items: [],
      notice:
        'No news source connected. Add EXPO_PUBLIC_NEWSAPI_KEY or EXPO_PUBLIC_FREENEWS_KEY to .env and restart the app.',
    };
  }

  const results = await Promise.all([fetchNewsApi(interests), fetchFreeNews(interests)]);
  const items = mergeSources(results);

  if (items.length > 0) {
    return { items };
  }

  return {
    items: [],
    error: 'No live stories could be loaded. Check your connection and API keys.',
    notice: results.find((result) => result.notice)?.notice,
  };
}
