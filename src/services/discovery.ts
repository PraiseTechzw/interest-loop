import { DEMO_DISCOVERY } from '@/data/demo';
import { fetchJson } from '@/lib/api';
import type { DiscoveryItem, FeedResult } from '@/types/models';

type HnStory = {
  id: number;
  title?: string;
  url?: string;
  score?: number;
  time?: number;
  type?: string;
};

type RedditResponse = {
  data?: {
    children?: {
      data?: {
        id?: string;
        title?: string;
        permalink?: string;
        selftext?: string;
        score?: number;
        created_utc?: number;
        domain?: string;
      };
    }[];
  };
};

function ageFromTimestamp(seconds: number): string {
  const hours = Math.max(1, Math.round((Date.now() / 1000 - seconds) / 3600));
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

function classify(title: string): DiscoveryItem['interest'] {
  const text = title.toLowerCase();
  const rules: [DiscoveryItem['interest'], string[]][] = [
    ['ci', ['spy', 'cia', 'intelligence', 'codebreak', 'surveillance', 'espionage']],
    ['mi6', ['mi6', 'secret service', 'mole', 'cold war']],
    ['3d', ['3d', 'render', 'gpu', 'webgpu', 'graphics']],
    ['animation', ['animation', 'anime', 'blender', 'motion']],
    ['learning', ['learn', 'course', 'book', 'science', 'memory', 'spaced']],
    ['romance', ['love', 'relationship', 'romance']],
    ['geek', ['software', 'developer', 'code', 'open source', 'startup', 'ai']],
  ];

  for (const [interest, keywords] of rules) {
    if (keywords.some((keyword) => text.includes(keyword))) return interest;
  }
  return 'problem-solving';
}

async function fetchHackerNews(): Promise<DiscoveryItem[]> {
  const ids = await fetchJson<number[]>(
    'https://hacker-news.firebaseio.com/v0/topstories.json',
    { timeoutMs: 8_000 },
  );

  const stories = await Promise.all(
    ids.slice(0, 12).map((id) =>
      fetchJson<HnStory>(`https://hacker-news.firebaseio.com/v0/item/${id}.json`, {
        timeoutMs: 8_000,
      }),
    ),
  );

  return stories
    .filter((story) => story.title && story.url)
    .map((story) => ({
      id: `hn-${story.id}`,
      title: story.title!,
      source: 'hacker-news' as const,
      url: story.url!,
      excerpt: 'A story the Hacker News community is discussing right now.',
      score: story.score ?? 0,
      age: story.time ? ageFromTimestamp(story.time) : 'recently',
      type: 'article' as const,
      interest: classify(story.title!),
    }));
}

async function fetchReddit(): Promise<DiscoveryItem[]> {
  const data = await fetchJson<RedditResponse>(
    'https://www.reddit.com/r/technology/top.json?limit=8&raw_json=1',
    { timeoutMs: 8_000, headers: { 'User-Agent': 'interest-loop/1.0' } },
  );

  return (data.data?.children ?? [])
    .map(({ data: post }) => post)
    .filter((post): post is NonNullable<typeof post> => Boolean(post?.title))
    .map((post) => ({
      id: `reddit-${post.id}`,
      title: post.title!,
      source: 'reddit' as const,
      url: post.permalink ? `https://www.reddit.com${post.permalink}` : 'https://www.reddit.com/',
      excerpt: (post.selftext ?? '').slice(0, 160) || 'A discussion from r/technology.',
      score: post.score ?? 0,
      age: post.created_utc ? ageFromTimestamp(post.created_utc) : 'recently',
      type: 'article' as const,
      interest: classify(post.title!),
    }));
}

/** Rank by community score with a light recency bonus (the "hidden gem" score). */
export function rankDiscovery(items: DiscoveryItem[]): DiscoveryItem[] {
  return [...items].sort((a, b) => {
    const freshnessA = a.age.includes('h') ? 12 : 4;
    const freshnessB = b.age.includes('h') ? 12 : 4;
    return b.score + freshnessB - (a.score + freshnessA);
  });
}

export async function fetchDiscovery(): Promise<FeedResult<DiscoveryItem>> {
  const results = await Promise.allSettled([fetchHackerNews(), fetchReddit()]);
  const live = results.flatMap((result) => (result.status === 'fulfilled' ? result.value : []));

  if (live.length === 0) {
    return {
      items: rankDiscovery(DEMO_DISCOVERY),
      isDemo: true,
      notice: 'Live feeds unavailable — showing curated finds.',
    };
  }

  const seen = new Set<string>();
  const unique = live.filter((item) => {
    if (seen.has(item.url)) return false;
    seen.add(item.url);
    return true;
  });

  return { items: rankDiscovery(unique).slice(0, 15), isDemo: false };
}
