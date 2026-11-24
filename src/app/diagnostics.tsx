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
    { label: 'News', query: news, data: news.data },
    { label: 'Movies', query: movies, data: movies.data },
    { label: 'Discovery', query: discovery, data: discovery.data },
    { label: 'Feedback store', query: feedback, data: feedback.data },
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
                Items: {source.data?.items?.length ?? source.data?.length ?? 0}
              </Text>
              <Text style={{ color: source.query.isError ? theme.danger : theme.textMuted, fontSize: 12, marginTop: 4 }}>
                Status: {source.query.isError ? 'error' : source.query.isFetching ? 'fetching' : 'idle'}
              </Text>
              {source.query.dataUpdatedAt ? (
                <Text style={{ color: theme.textMuted, fontSize: 12, marginTop: 4 }}>
                  Last updated: {formatDate(new Date(source.query.dataUpdatedAt).toISOString())}
                </Text>
              ) : null}
              {'error' in (source.data ?? {}) && source.data?.error ? (
                <Text style={{ color: theme.danger, fontSize: 12, marginTop: 4 }}>{source.data.error}</Text>
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
