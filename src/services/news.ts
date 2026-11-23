import { INTEREST_BY_ID, type InterestId } from '@/constants/interests';
import { DEMO_NEWS } from '@/data/demo';
import { buildUrl, fetchJson } from '@/lib/api';
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

function demoFor(interests: InterestId[]): NewsArticle[] {
  return DEMO_NEWS.filter((article) => interests.includes(article.interest));
}

async function fetchNewsApi(interests: InterestId[]): Promise<FeedResult<NewsArticle>> {
  const apiKey = process.env.EXPO_PUBLIC_NEWSAPI_KEY?.trim();

  if (!apiKey || interests.length === 0) {
    return { items: [], isDemo: false };
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
        const haystack = `${article.title ?? ''} ${article.description ?? ''} ${sourceName}`.toLowerCase();
        const matchingInterest =
          interests.find((id) =>
            INTEREST_BY_ID[id].newsQuery
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

    if (items.length === 0) {
      return { items: [], isDemo: false, notice: 'No live stories matched from NewsAPI.' };
    }

    return { items, isDemo: false };
  } catch {
    return { items: [], isDemo: false, notice: 'NewsAPI unavailable.' };
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

export async function fetchNews(interests: InterestId[]): Promise<FeedResult<NewsArticle>> {
  const hasNewsApiKey = Boolean(process.env.EXPO_PUBLIC_NEWSAPI_KEY?.trim());
  const hasFreeNewsKey = Boolean(process.env.EXPO_PUBLIC_FREENEWS_KEY?.trim());

  const results = await Promise.all([fetchNewsApi(interests), fetchFreeNews(interests)]);
  const items = mergeSources(results);

  if (items.length > 0) {
    return { items, isDemo: false };
  }

  const notice =
    !hasNewsApiKey && !hasFreeNewsKey
      ? 'Sample stories — add EXPO_PUBLIC_NEWSAPI_KEY or EXPO_PUBLIC_FREENEWS_KEY for live news.'
      : results.find((result) => result.notice)?.notice ??
        'Live news unavailable — showing sample stories.';

  return {
    items: demoFor(interests),
    isDemo: true,
    notice,
  };
}
