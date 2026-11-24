import {
  INTERESTS,
  RELATED_INTERESTS,
  makeCustomInterest,
  type Interest,
  type InterestIcon,
} from '@/constants/interests';

/**
 * Small registry shared by pure services (news, movies, graph) and the UI.
 * Custom topics are loaded from SQLite on boot and re-registered whenever they
 * change, so feed adapters can resolve an id without needing a React hook.
 */
const registry = new Map<string, Interest>(INTERESTS.map((interest) => [interest.id, interest]));
let customIds = new Set<string>();

export function registerCustomInterests(interests: Interest[]): void {
  for (const id of customIds) registry.delete(id);
  customIds = new Set(interests.map((interest) => interest.id));
  for (const interest of interests) registry.set(interest.id, interest);
}

/** Never throws: unknown/legacy tags degrade to a readable label. */
export function getInterest(id: string): Interest {
  return (
    registry.get(id) ??
    makeCustomInterest({
      id,
      label: id || 'Unknown',
      newsQuery: id,
    })
  );
}

export function listInterests(): Interest[] {
  return Array.from(registry.values());
}

export function getRelatedInterests(id: string): string[] {
  return RELATED_INTERESTS[id] ?? [];
}

export function isCustomInterest(id: string): boolean {
  return customIds.has(id);
}

export function toStoredInterest(row: {
  id: string;
  label: string;
  color: string | null;
  icon: string | null;
  news_query: string | null;
  movie_genres: string | null;
}): Interest {
  return makeCustomInterest({
    id: row.id,
    label: row.label,
    color: row.color ?? undefined,
    icon: (row.icon ?? undefined) as InterestIcon | undefined,
    newsQuery: row.news_query ?? undefined,
    movieGenres: (row.movie_genres ?? '')
      .split(',')
      .filter(Boolean)
      .map(Number)
      .filter((value) => Number.isFinite(value)),
  });
}
