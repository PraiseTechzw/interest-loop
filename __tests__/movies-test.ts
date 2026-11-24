import { fetchMovies, rankingScore } from '@/services/movies';

const mockFetchJson = jest.fn();

jest.mock('@/lib/api', () => ({
  ...jest.requireActual('@/lib/api'),
  fetchJson: (...args: unknown[]) => mockFetchJson(...args),
}));

describe('fetchMovies', () => {
  beforeEach(() => {
    mockFetchJson.mockReset();
    process.env.EXPO_PUBLIC_TMDB_KEY = 'tmdb-key';
  });

  it('matches any selected genre instead of requiring all of them', async () => {
    mockFetchJson.mockResolvedValue({
      results: [{ id: 1, title: 'A movie', genre_ids: [28] }],
    });

    const result = await fetchMovies(['ci', 'geek']);
    const url = mockFetchJson.mock.calls[0][0] as string;

    expect(new URL(url).searchParams.get('with_genres')).toBe('28|53|35|878');
    expect(result.items).toHaveLength(1);
    expect(result.items[0].title).toBe('A movie');
  });

  it('explains empty live results without claiming the source is missing', async () => {
    mockFetchJson.mockResolvedValue({ results: [] });

    const result = await fetchMovies(['ci']);

    expect(result.items).toEqual([]);
    expect(result.error).toBeUndefined();
    expect(result.notice).toMatch(/No movies matched your interests/);
  });

  it('ranks a well-voted film above a thinly voted one with a higher rating', () => {
    expect(rankingScore(8.1, 18_000)).toBeGreaterThan(rankingScore(9.2, 40));
  });

  it('does not call TMDB when no key is configured', async () => {
    delete process.env.EXPO_PUBLIC_TMDB_KEY;

    const result = await fetchMovies(['ci']);

    expect(mockFetchJson).not.toHaveBeenCalled();
    expect(result.notice).toMatch(/EXPO_PUBLIC_TMDB_KEY/);
  });
});
