import { getInterest, getRelatedInterests, isCustomInterest } from '@/lib/interest-catalogue';
import type { GraphEdge, GraphNode } from '@/types/models';

/** Deterministic circular layout: stable between renders and across devices. */
export function buildGraph(
  interests: string[],
  activity: Record<string, number>,
): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const count = Math.max(interests.length, 1);
  const nodes: GraphNode[] = interests.map((id, index) => {
    const angle = (index / count) * Math.PI * 2 - Math.PI / 2;
    const radius = count <= 4 ? 118 : 138;
    const interest = getInterest(id);

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

  const addEdge = (a: string, b: string) => {
    if (a === b || !ids.has(b)) return;
    const from = a < b ? a : b;
    const to = a < b ? b : a;
    const key = `${from}:${to}`;
    if (edgeKeys.has(key)) return;
    edgeKeys.add(key);
    const sharedActivity = Math.min(activity[from] ?? 0, activity[to] ?? 0);
    edges.push({ id: key, from, to, strength: Math.min(3, 1 + sharedActivity) });
  };

  for (const id of interests) {
    for (const related of getRelatedInterests(id)) addEdge(id, related);
  }

  // Custom topics have no curated neighbours: connect them to topics you saved alongside.
  for (const id of interests) {
    if (!isCustomInterest(id)) continue;
    for (const other of interests) {
      if ((activity[id] ?? 0) > 0 && (activity[other] ?? 0) > 0) addEdge(id, other);
    }
  }

  return { nodes, edges };
}
