import type { InterestId } from '@/constants/interests';
import { buildUrl, fetchJson } from '@/lib/api';
import type { FeedResult, NewsArticle } from '@/types/models';

/**
 * FreeNewsApi.io adapter.
 *
 * The list endpoint returns lightweight items (uuid, title, publisher, date) with no
 * URL or image, so a details call is needed before a story can be shown. The free
 * plan allows 2 requests/sec — requests are queued through `pacedFetchJson` so
 * concurrent list/detail calls stay within that limit.
 */

const BASE_URL = 'https://api.freenewsapi.io/v1';
const MIN_REQUEST_INTERVAL_MS = 550;
const INTERESTS_TO_QUERY = 4;
const ARTICLES_PER_INTEREST = 2;

/** `in_title` uses AND semantics, so each interest maps to a short keyword phrase. */
const SEARCH_TERMS: Record<InterestId, string> = {
  ci: 'intelligence',
  mi6: 'espionage',
  geek: 'technology',
  romance: 'romance',
  '3d': 'animation',
  animation: 'Blender',
  learning: 'science',
  'problem-solving': 'problem solving',
};

type FreeNewsItem = {
  uuid?: string;
  title?: string;
  published_at?: string;
  publisher?: string | null;
};

type FreeNewsListResponse = {
  data?: FreeNewsItem[];
};

type FreeNewsDetails = {
  uuid?: string;
  title?: string;
  original_url?: string;
  incipit?: string | null;
  body?: string | null;
  thumbnail?: string | null;
  publisher?: string | null;
  published_at?: string;
};

type FreeNewsDetailsResponse = { data?: FreeNewsDetails };

let requestQueue: Promise<unknown> = Promise.resolve();
let lastRequestAt = 0;

/** Serialize calls and space them out to respect the 2 req/sec free-tier limit. */
function pacedFetchJson<T>(url: string, apiKey: string): Promise<T> {
  const result = requestQueue.then(async () => {
    const wait = MIN_REQUEST_INTERVAL_MS - (Date.now() - lastRequestAt);
    if (wait > 0) {
      await new Promise<void>((resolve) => setTimeout(resolve, wait));
    }
    lastRequestAt = Date.now();
    return fetchJson<T>(url, { headers: { 'x-api-key': apiKey } });
  });

  // A rejected request must not break the queue for subsequent calls.
  requestQueue = result.catch(() => undefined);
  return result;
}

function toArticle(
  item: FreeNewsItem,
  details: FreeNewsDetails,
  interest: InterestId,
): NewsArticle | null {
  const title = (details.title ?? item.title ?? '').trim();
  const url = details.original_url?.trim();
  if (!title || !url) return null;

  return {
    id: details.uuid ?? item.uuid ?? url,
    title,
    description: (details.incipit ?? details.body ?? '').trim(),
    content: (details.body ?? details.incipit ?? '').trim() || null,
    url,
    source: details.publisher ?? item.publisher ?? 'FreeNewsApi',
    imageUrl: details.thumbnail ?? null,
    publishedAt: details.published_at ?? item.published_at ?? new Date().toISOString(),
    interest,
  };
}

export async function fetchFreeNews(interests: InterestId[]): Promise<FeedResult<NewsArticle>> {
  const apiKey = process.env.EXPO_PUBLIC_FREENEWS_KEY?.trim();

  if (!apiKey || interests.length === 0) {
    return { items: [] };
  }

  try {
    const selected = interests.slice(0, INTERESTS_TO_QUERY);
    const lists = await Promise.all(
      selected.map((interest) =>
        pacedFetchJson<FreeNewsListResponse>(
          buildUrl(`${BASE_URL}/news`, {
            language: 'en',
            in_title: SEARCH_TERMS[interest],
            order_by: 'recent',
          }),
          apiKey,
        ),
      ),
    );

    const candidates = selected.flatMap((interest, index) =>
      (lists[index].data ?? []).slice(0, ARTICLES_PER_INTEREST).map((item) => ({ item, interest })),
    );

    const details = await Promise.allSettled(
      candidates.map(({ item }) =>
        item.uuid
          ? pacedFetchJson<FreeNewsDetailsResponse>(
              buildUrl(`${BASE_URL}/details`, { uuid: item.uuid }),
              apiKey,
            )
          : Promise.reject(new Error('Missing article uuid')),
      ),
    );

    const seen = new Set<string>();
    const items = candidates.flatMap(({ item, interest }, index) => {
      const result = details[index];
      if (result.status !== 'fulfilled') return [];
      const article = toArticle(item, result.value.data ?? {}, interest);
      if (!article || seen.has(article.url)) return [];
      seen.add(article.url);
      return [article];
    });

    if (items.length === 0) {
      return { items: [], notice: 'No live stories matched from FreeNewsApi.' };
    }

    return { items };
  } catch {
    return { items: [], notice: 'FreeNewsApi unavailable.' };
  }
}
