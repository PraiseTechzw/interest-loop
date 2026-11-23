import { rankDiscovery } from '@/services/discovery';
import type { DiscoveryItem } from '@/types/models';

function makeItem(id: string, score: number, age: string): DiscoveryItem {
  return {
    id,
    title: `Story ${id}`,
    source: 'curated',
    url: `https://example.com/${id}`,
    excerpt: 'A short excerpt.',
    score,
    age,
    type: 'article',
    interest: 'geek',
  };
}

describe('rankDiscovery', () => {
  it('ranks by community score with a recency bonus', () => {
    const ranked = rankDiscovery([
      makeItem('stale-high', 15, '2d ago'),
      makeItem('fresh-mid', 10, '1h ago'),
      makeItem('fresh-low', 5, '3h ago'),
    ]);

    // 10 + 12 = 22, 15 + 4 = 19, 5 + 12 = 17
    expect(ranked.map((item) => item.id)).toEqual(['fresh-mid', 'stale-high', 'fresh-low']);
  });

  it('prefers a fresh item over an older item with the same score', () => {
    const ranked = rankDiscovery([makeItem('old', 20, '5d ago'), makeItem('new', 20, '2h ago')]);

    expect(ranked.map((item) => item.id)).toEqual(['new', 'old']);
  });

  it('treats ages without an hour marker as the low-recency tier', () => {
    const ranked = rankDiscovery([
      makeItem('days', 8, '4d ago'),
      makeItem('hours', 1, '9h ago'),
      makeItem('recently', 1, 'recently'),
    ]);

    expect(ranked.map((item) => item.id)).toEqual(['hours', 'days', 'recently']);
  });

  it('does not mutate the input array', () => {
    const input = [
      makeItem('a', 1, '1d ago'),
      makeItem('b', 50, '1h ago'),
      makeItem('c', 5, '2h ago'),
    ];
    const originalOrder = input.map((item) => item.id);
    const originalItems = [...input];

    const ranked = rankDiscovery(input);

    expect(input.map((item) => item.id)).toEqual(originalOrder);
    expect(input).toEqual(originalItems);
    expect(ranked).not.toBe(input);
    expect(ranked.map((item) => item.id)).toEqual(['b', 'c', 'a']);
  });

  it('handles empty and single-item arrays', () => {
    expect(rankDiscovery([])).toEqual([]);

    const single = makeItem('only', 3, '1h ago');
    expect(rankDiscovery([single])).toEqual([single]);
  });
});
