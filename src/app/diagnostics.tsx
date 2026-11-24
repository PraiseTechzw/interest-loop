import Constants from 'expo-constants';
import { Stack } from 'expo-router';
import { ScrollView, Text } from 'react-native';

import { Card, NoticeBanner, Screen, ScreenContent, ScreenHeader, SectionHeader } from '@/components/ui';
import {
  useDiscoveryFeed,
  useInterests,
  useMovieFeed,
  useNews,
  useFeedback,
} from '@/hooks/use-app-data';
import { formatDate } from '@/lib/format';
import { useTheme } from '@/theme/tokens';

export default function DiagnosticsScreen() {
  const theme = useTheme();
  const news = useNews(useInterests().data ?? []);
  const movies = useMovieFeed(useInterests().data ?? []);
  const discovery = useDiscoveryFeed();
  const feedback = useFeedback();

  const sources = [
    { label: 'News', query: news, items: news.data?.items.length ?? 0, error: news.data?.error, updatedAt: news.dataUpdatedAt },
    { label: 'Movies', query: movies, items: movies.data?.items.length ?? 0, error: movies.data?.error, updatedAt: movies.dataUpdatedAt },
    { label: 'Discovery', query: discovery, items: discovery.data?.items.length ?? 0, error: discovery.data?.error, updatedAt: discovery.dataUpdatedAt },
    { label: 'Feedback store', query: feedback, items: feedback.data?.length ?? 0, error: undefined as string | undefined, updatedAt: feedback.dataUpdatedAt },
  ];

  const keyStatus = [
    { label: 'NewsAPI', set: Boolean(process.env.EXPO_PUBLIC_NEWSAPI_KEY?.trim()) },
    { label: 'FreeNewsApi', set: Boolean(process.env.EXPO_PUBLIC_FREENEWS_KEY?.trim()) },
    { label: 'TMDB', set: Boolean(process.env.EXPO_PUBLIC_TMDB_KEY?.trim()) },
  ];

  return (
    <Screen>
      <Stack.Screen options={{ title: 'Diagnostics' }} />
      <ScrollView>
        <ScreenContent>
          <ScreenHeader title="Diagnostics" subtitle="Connection state and last fetch times for testing installs." />

          <NoticeBanner message="No key values are shown here — only whether a variable is available to this build." />

          <SectionHeader title="Environment keys" />
          <Card>
            {keyStatus.map((key) => (
              <Text key={key.label} style={{ color: key.set ? theme.success : theme.textMuted, marginBottom: 8 }}>
                {key.label}: {key.set ? 'available' : 'missing'}
              </Text>
            ))}
          </Card>

          <SectionHeader title="Feed health" />
          {sources.map((source) => (
            <Card key={source.label}>
              <Text style={{ color: theme.text, fontWeight: '700' }}>{source.label}</Text>
              <Text style={{ color: theme.textMuted, fontSize: 12, marginTop: 4 }}>
                Items: {source.items}
              </Text>
              <Text style={{ color: source.query.isError ? theme.danger : theme.textMuted, fontSize: 12, marginTop: 4 }}>
                Status: {source.query.isError ? 'error' : source.query.isFetching ? 'fetching' : 'idle'}
              </Text>
              {source.updatedAt ? (
                <Text style={{ color: theme.textMuted, fontSize: 12, marginTop: 4 }}>
                  Last updated: {formatDate(new Date(source.updatedAt).toISOString())}
                </Text>
              ) : null}
              {source.error ? (
                <Text style={{ color: theme.danger, fontSize: 12, marginTop: 4 }}>{source.error}</Text>
              ) : null}
            </Card>
          ))}

          <SectionHeader title="Build info" />
          <Card>
            <Text style={{ color: theme.textMuted, fontSize: 12, lineHeight: 18 }}>
              Version: {Constants.expoConfig?.version ?? 'unknown'}
            {'\n'}SDK: {Constants.expoConfig?.sdkVersion ?? '58'}
            {'\n'}Platform: {Constants.expoConfig?.name ?? 'InterestLoop'}
            </Text>
          </Card>
        </ScreenContent>
      </ScrollView>
    </Screen>
  );
}
