import { INTEREST_BY_ID, RELATED_INTERESTS, type InterestId } from '@/constants/interests';
import type { GraphEdge, GraphNode } from '@/types/models';

/** Deterministic circular layout: stable between renders and across devices. */
export function buildGraph(
  interests: InterestId[],
  activity: Record<string, number>,
): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const count = Math.max(interests.length, 1);
  const nodes: GraphNode[] = interests.map((id, index) => {
    const angle = (index / count) * Math.PI * 2 - Math.PI / 2;
    const radius = count <= 4 ? 118 : 138;
    const interest = INTEREST_BY_ID[id];

    return {
      id,
      label: interest.short,
      color: interest.color,
      interest: id,
      savedCount: activity[id] ?? 0,
      x: 180 + radius * Math.cos(angle),
      y: 180 + radius * Math.sin(angle),
    };
  });

  const edgeKeys = new Set<string>();
  const edges: GraphEdge[] = [];
  const ids = new Set(interests);

  for (const id of interests) {
    for (const related of RELATED_INTERESTS[id]) {
      if (!ids.has(related)) continue;
      const from = id < related ? id : related;
      const to = id < related ? related : id;
      const key = `${from}:${to}`;
      if (edgeKeys.has(key)) continue;
      edgeKeys.add(key);

      const sharedActivity = Math.min(activity[from] ?? 0, activity[to] ?? 0);
      edges.push({ id: key, from, to, strength: Math.min(3, 1 + sharedActivity) });
    }
  }

  return { nodes, edges };
}
