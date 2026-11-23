import { fetchFreeNews } from '@/services/free-news';

const mockFetchJson = jest.fn();

jest.mock('@/lib/api', () => ({
  ...jest.requireActual('@/lib/api'),
  fetchJson: (...args: unknown[]) => mockFetchJson(...args),
}));

const listItem = (uuid: string, title: string) => ({
  uuid,
  title,
  published_at: '2026-11-20T10:00:00.000Z',
  publisher: 'Example Publisher',
});

const details = (uuid: string, title: string) => ({
  data: {
    uuid,
    title,
    original_url: `https://example.com/${uuid}`,
    incipit: 'A short summary.',
    thumbnail: 'https://example.com/image.jpg',
    publisher: 'Example Publisher',
    published_at: '2026-11-20T10:00:00.000Z',
  },
});

describe('fetchFreeNews', () => {
  let clock = 0;

  beforeEach(() => {
    mockFetchJson.mockReset();
    process.env.EXPO_PUBLIC_FREENEWS_KEY = 'test-key';
    // Keep the adapter's request pacing from inserting real delays in tests.
    // The clock must keep increasing across tests: the adapter tracks the last
    // request time at module scope.
    jest.spyOn(Date, 'now').mockImplementation(() => (clock += 1000));
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete process.env.EXPO_PUBLIC_FREENEWS_KEY;
  });

  it('does nothing without an API key or interests', async () => {
    delete process.env.EXPO_PUBLIC_FREENEWS_KEY;

    await expect(fetchFreeNews(['ci'])).resolves.toEqual({ items: [], isDemo: false });
    expect(mockFetchJson).not.toHaveBeenCalled();

    process.env.EXPO_PUBLIC_FREENEWS_KEY = 'test-key';
    await expect(fetchFreeNews([])).resolves.toEqual({ items: [], isDemo: false });
    expect(mockFetchJson).not.toHaveBeenCalled();
  });

  it('maps list plus details into articles tagged with the interest', async () => {
    mockFetchJson.mockImplementation((url: string) => {
      if (url.includes('/news?')) {
        return Promise.resolve({ data: [listItem('a', 'Intelligence story')] });
      }
      return Promise.resolve(details('a', 'Intelligence story'));
    });

    const result = await fetchFreeNews(['ci']);

    expect(result.isDemo).toBe(false);
    expect(result.items).toHaveLength(1);
    expect(result.items[0]).toMatchObject({
      id: 'a',
      title: 'Intelligence story',
      description: 'A short summary.',
      url: 'https://example.com/a',
      source: 'Example Publisher',
      imageUrl: 'https://example.com/image.jpg',
      interest: 'ci',
    });
    expect(mockFetchJson).toHaveBeenCalledWith(expect.stringContaining('in_title=intelligence'), {
      headers: { 'x-api-key': 'test-key' },
    });
    expect(mockFetchJson).toHaveBeenCalledWith(
      expect.stringContaining('/details?uuid=a'),
      expect.any(Object),
    );
  });

  it('keeps stories whose details request fails and skips incomplete ones', async () => {
    mockFetchJson.mockImplementation((url: string) => {
      if (url.includes('/news?')) {
        return Promise.resolve({ data: [listItem('a', 'First'), listItem('b', 'Second')] });
      }
      if (url.includes('uuid=a')) return Promise.resolve(details('a', 'First'));
      if (url.includes('uuid=b')) return Promise.reject(new Error('not found'));
      return Promise.resolve({ data: {} });
    });

    const result = await fetchFreeNews(['geek']);

    expect(result.items).toHaveLength(1);
    expect(result.items[0].url).toBe('https://example.com/a');
  });

  it('deduplicates stories returned for multiple interests', async () => {
    mockFetchJson.mockImplementation((url: string) => {
      if (url.includes('/news?')) {
        return Promise.resolve({ data: [listItem('a', 'Shared story')] });
      }
      return Promise.resolve(details('a', 'Shared story'));
    });

    const result = await fetchFreeNews(['ci', 'mi6']);

    expect(result.items).toHaveLength(1);
  });

  it('falls back cleanly when the source is unreachable', async () => {
    mockFetchJson.mockRejectedValue(new Error('offline'));

    const result = await fetchFreeNews(['ci']);

    expect(result).toEqual({
      items: [],
      isDemo: false,
      notice: 'FreeNewsApi unavailable.',
    });
  });
});
