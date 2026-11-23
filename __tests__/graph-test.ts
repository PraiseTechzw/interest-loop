import type { InterestId } from '@/constants/interests';
import { buildGraph } from '@/lib/graph';

describe('buildGraph', () => {
  const activity: Record<string, number> = { ci: 2, mi6: 1, geek: 5, '3d': 0 };

  it('creates exactly one node per selected interest', () => {
    const selected: InterestId[] = ['ci', 'mi6', 'geek', '3d'];
    const { nodes } = buildGraph(selected, activity);

    expect(nodes).toHaveLength(selected.length);
    expect(nodes.map((node) => node.id).sort()).toEqual([...selected].sort());
  });

  it('returns no nodes or edges for an empty selection', () => {
    expect(buildGraph([], {})).toEqual({ nodes: [], edges: [] });
  });

  it('positions nodes deterministically on a circle (radius 118 for four interests)', () => {
    const selected: InterestId[] = ['ci', 'mi6', 'geek', '3d'];
    const first = buildGraph(selected, activity);
    const second = buildGraph(selected, activity);

    expect(second).toEqual(first);

    const [a, b, c, d] = first.nodes;
    expect(a.x).toBeCloseTo(180, 6);
    expect(a.y).toBeCloseTo(62, 6);
    expect(b.x).toBeCloseTo(298, 6);
    expect(b.y).toBeCloseTo(180, 6);
    expect(c.x).toBeCloseTo(180, 6);
    expect(c.y).toBeCloseTo(298, 6);
    expect(d.x).toBeCloseTo(62, 6);
    expect(d.y).toBeCloseTo(180, 6);
  });

  it('uses the larger radius (138) when more than four interests are selected', () => {
    const selected: InterestId[] = ['ci', 'mi6', 'geek', '3d', 'learning'];
    const { nodes } = buildGraph(selected, activity);

    expect(nodes).toHaveLength(5);
    expect(nodes[0].x).toBeCloseTo(180, 6);
    expect(nodes[0].y).toBeCloseTo(42, 6);

    const angle = (1 / 5) * Math.PI * 2 - Math.PI / 2;
    expect(nodes[1].x).toBeCloseTo(180 + 138 * Math.cos(angle), 6);
    expect(nodes[1].y).toBeCloseTo(180 + 138 * Math.sin(angle), 6);
  });

  it('uses the interest short label and color for each node', () => {
    const { nodes } = buildGraph(['ci', 'geek'], {});
    const byId = Object.fromEntries(nodes.map((node) => [node.id, node]));

    expect(byId.ci).toMatchObject({ label: 'CIA', color: '#5B4FE9', interest: 'ci' });
    expect(byId.geek).toMatchObject({ label: 'Geek', color: '#7B52D8', interest: 'geek' });
  });

  it('reflects savedCount from activity and defaults to 0', () => {
    const { nodes } = buildGraph(['ci', 'mi6', 'geek'], { ci: 4, geek: 7 });
    const counts = Object.fromEntries(nodes.map((node) => [node.id, node.savedCount]));

    expect(counts).toEqual({ ci: 4, mi6: 0, geek: 7 });
  });

  it('only creates edges between selected interests', () => {
    const { edges } = buildGraph(['ci', 'mi6'], activity);

    expect(edges).toHaveLength(1);
    expect(edges[0]).toMatchObject({ id: 'ci:mi6', from: 'ci', to: 'mi6' });

    const wider: InterestId[] = ['ci', 'mi6', 'geek', 'learning'];
    const widerIds = new Set<string>(wider);
    const all = buildGraph(wider, activity);
    expect(all.edges.length).toBeGreaterThan(0);
    for (const edge of all.edges) {
      expect(widerIds.has(edge.from)).toBe(true);
      expect(widerIds.has(edge.to)).toBe(true);
    }
    // "problem-solving" is related to selected interests but was not selected.
    expect(
      all.edges.some((edge) => edge.from === 'problem-solving' || edge.to === 'problem-solving'),
    ).toBe(false);
  });

  it('emits no edges when no selected interests are related', () => {
    expect(buildGraph(['romance', 'problem-solving'], {}).edges).toEqual([]);
  });

  it('does not create duplicate edges for reciprocal relationships', () => {
    const all: InterestId[] = [
      'ci',
      'mi6',
      'geek',
      'romance',
      '3d',
      'animation',
      'learning',
      'problem-solving',
    ];
    const { edges } = buildGraph(all, {});

    const edgeIds = edges.map((edge) => edge.id);
    const pairs = edges.map((edge) => `${edge.from}:${edge.to}`);

    expect(edgeIds.length).toBeGreaterThan(0);
    expect(new Set(edgeIds).size).toBe(edgeIds.length);
    expect(new Set(pairs).size).toBe(pairs.length);
    for (const edge of edges) {
      expect(edge.from < edge.to).toBe(true);
      expect(edge.id).toBe(`${edge.from}:${edge.to}`);
    }
  });

  it('derives edge strength from shared activity, capped at 3', () => {
    expect(buildGraph(['ci', 'mi6'], { ci: 5, mi6: 10 }).edges[0].strength).toBe(3);
    expect(buildGraph(['ci', 'mi6'], { ci: 1, mi6: 2 }).edges[0].strength).toBe(2);
    expect(buildGraph(['ci', 'mi6'], {}).edges[0].strength).toBe(1);
  });
});
