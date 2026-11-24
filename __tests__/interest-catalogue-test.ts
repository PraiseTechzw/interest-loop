import { makeCustomInterest } from '@/constants/interests';
import {
  getInterest,
  getRelatedInterests,
  isCustomInterest,
  registerCustomInterests,
  toStoredInterest,
} from '@/lib/interest-catalogue';

describe('interest catalogue', () => {
  afterEach(() => registerCustomInterests([]));

  it('resolves built-in topics without registration', () => {
    expect(getInterest('ci')).toMatchObject({ id: 'ci', label: 'CIA & Intelligence', short: 'CIA' });
    expect(getRelatedInterests('ci')).toContain('mi6');
  });

  it('degrades unknown tags to a readable fallback', () => {
    expect(getInterest('old-tag')).toMatchObject({
      id: 'old-tag',
      label: 'old-tag',
      custom: true,
    });
    expect(getRelatedInterests('my-topic')).toEqual([]);
  });

  it('registers custom topics for feed adapters and the graph', () => {
    const custom = makeCustomInterest({
      id: 'custom-watches',
      label: 'Vintage watches',
      color: '#123456',
      newsQuery: 'watch OR horology',
    });

    registerCustomInterests([custom]);

    expect(getInterest('custom-watches')).toMatchObject({
      label: 'Vintage watches',
      color: '#123456',
      newsQuery: 'watch OR horology',
      custom: true,
    });
    expect(isCustomInterest('custom-watches')).toBe(true);
    expect(getInterest('ci').label).toBe('CIA & Intelligence');
  });

  it('drops stale custom topics when re-registered', () => {
    registerCustomInterests([makeCustomInterest({ id: 'custom-a', label: 'A' })]);
    registerCustomInterests([makeCustomInterest({ id: 'custom-b', label: 'B' })]);

    expect(isCustomInterest('custom-a')).toBe(false);
    expect(getInterest('custom-a').label).toBe('custom-a');
    expect(getInterest('custom-b').label).toBe('B');
  });

  it('rebuilds a stored custom interest row', () => {
    const interest = toStoredInterest({
      id: 'custom-1',
      label: 'Side project',
      color: null,
      icon: null,
      news_query: null,
      movie_genres: '28,53',
    });

    expect(interest).toMatchObject({
      id: 'custom-1',
      label: 'Side project',
      movieGenres: [28, 53],
      custom: true,
    });
  });
});
