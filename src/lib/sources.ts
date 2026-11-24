/** Single source of truth for live-feed connection status across the app. */

export type DataSource = {
  key: 'newsApi' | 'freeNews' | 'tmdb';
  label: string;
  connected: boolean;
};

export function getDataSources(): DataSource[] {
  return [
    {
      key: 'newsApi',
      label: 'NewsAPI',
      connected: Boolean(process.env.EXPO_PUBLIC_NEWSAPI_KEY?.trim()),
    },
    {
      key: 'freeNews',
      label: 'FreeNewsApi',
      connected: Boolean(process.env.EXPO_PUBLIC_FREENEWS_KEY?.trim()),
    },
    {
      key: 'tmdb',
      label: 'TMDB',
      connected: Boolean(process.env.EXPO_PUBLIC_TMDB_KEY?.trim()),
    },
  ];
}

export function sourceStatusLabel(connected: boolean): string {
  return connected ? 'Connected' : 'Not connected';
}
