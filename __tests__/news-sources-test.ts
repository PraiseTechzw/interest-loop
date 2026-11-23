import { fetchNews } from '@/services/news';
import type { FeedResult, NewsArticle } from '@/types/models';

const mockFetchJson = jest.fn();
const mockFetchFreeNews = jest.fn<Promise<FeedResult<NewsArticle>>, unknown[]>();

jest.mock('@/lib/api', () => ({
  ...jest.requireActual('@/lib/api'),
  fetchJson: (...args: unknown[]) => mockFetchJson(...args),
}));

jest.mock('@/services/free-news', () => ({
  fetchFreeNews: (...args: unknown[]) => mockFetchFreeNews(...args),
}));

const article = (url: string, publishedAt: string): NewsArticle => ({
  id: url,
  title: url,
  description: '',
  url,
  source: 'Source',
  publishedAt,
  interest: 'ci',
});

describe('fetchNews sources', () => {
  beforeEach(() => {
    mockFetchJson.mockReset();
    mockFetchFreeNews.mockReset();
    mockFetchFreeNews.mockResolvedValue({ items: [], isDemo: false });
    delete process.env.EXPO_PUBLIC_NEWSAPI_KEY;
    delete process.env.EXPO_PUBLIC_FREENEWS_KEY;
  });

  it('merges both sources, removes duplicate URLs and sorts newest first', async () => {
    process.env.EXPO_PUBLIC_NEWSAPI_KEY = 'news-key';
    process.env.EXPO_PUBLIC_FREENEWS_KEY = 'free-key';

    mockFetchJson.mockResolvedValue({
      articles: [
        {
          title: 'Older NewsAPI story',
          url: 'https://news.example/old',
          publishedAt: '2026-11-18T10:00:00.000Z',
        },
        {
          title: 'Newer NewsAPI story',
          url: 'https://news.example/new',
          publishedAt: '2026-11-22T10:00:00.000Z',
        },
      ],
    });
    mockFetchFreeNews.mockResolvedValue({
      items: [
        article('https://news.example/old', '2026-11-18T10:00:00.000Z'),
        article('https://free.example/new', '2026-11-23T10:00:00.000Z'),
      ],
      isDemo: false,
    });

    const result = await fetchNews(['ci']);

    expect(result.isDemo).toBe(false);
    expect(result.items.map((item) => item.url)).toEqual([
      'https://free.example/new',
      'https://news.example/new',
      'https://news.example/old',
    ]);
    expect(mockFetchFreeNews).toHaveBeenCalledWith(['ci']);
  });

  it('returns demo news only when neither source is configured', async () => {
    const result = await fetchNews(['ci']);

    expect(result.isDemo).toBe(true);
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.notice).toContain('EXPO_PUBLIC_FREENEWS_KEY');
    expect(mockFetchFreeNews).toHaveBeenCalled();
  });

  it('uses FreeNewsApi alone when only its key is configured', async () => {
    process.env.EXPO_PUBLIC_FREENEWS_KEY = 'free-key';
    mockFetchFreeNews.mockResolvedValue({
      items: [article('https://free.example/only', '2026-11-23T10:00:00.000Z')],
      isDemo: false,
    });

    const result = await fetchNews(['ci']);

    expect(result.isDemo).toBe(false);
    expect(result.items).toHaveLength(1);
    expect(mockFetchJson).not.toHaveBeenCalled();
  });
});
