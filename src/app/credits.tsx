import { ScrollView, Text } from 'react-native';

import { Card, Screen, ScreenContent, ScreenHeader, SectionHeader } from '@/components/ui';
import { openExternalUrl } from '@/lib/links';
import { useTheme } from '@/theme/tokens';

const CREDITS = [
  {
    name: 'TheMovieDB (TMDB)',
    note: 'This product uses the TMDB API but is not endorsed or certified by TMDB.',
    url: 'https://www.themoviedb.org/',
  },
  {
    name: 'NewsAPI.org',
    note: 'News headlines and article metadata are provided by NewsAPI.',
    url: 'https://newsapi.org/',
  },
  {
    name: 'FreeNewsApi.io',
    note: 'Additional headlines are provided by FreeNewsApi.',
    url: 'https://freenewsapi.io/',
  },
  {
    name: 'Hacker News',
    note: 'Top stories are loaded from the public Hacker News Firebase API.',
    url: 'https://news.ycombinator.com/',
  },
  {
    name: 'Reddit',
    note: 'Community discussions are loaded from Reddit’s public JSON endpoints.',
    url: 'https://www.reddit.com/',
  },
  {
    name: 'Expo & React Native',
    note: 'Built with Expo SDK 58, Expo Router, TanStack Query and expo-sqlite.',
    url: 'https://expo.dev/',
  },
];

export default function CreditsScreen() {
  const theme = useTheme();

  return (
    <Screen>
      <ScrollView>
        <ScreenContent>
          <ScreenHeader
            title="Credits"
            subtitle="The services that power InterestLoop."
          />

          <SectionHeader title="Data sources" />
          {CREDITS.map((credit) => (
            <Card key={credit.name}>
              <Text
                accessibilityRole="link"
                onPress={() => openExternalUrl(credit.url)}
                style={{ color: theme.primary, fontSize: 15, fontWeight: '700' }}>
                {credit.name} →
              </Text>
              <Text style={{ color: theme.textMuted, fontSize: 13, lineHeight: 19, marginTop: 6 }}>
                {credit.note}
              </Text>
            </Card>
          ))}

          <Text style={{ color: theme.textMuted, fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 24 }}>
            All saved content stays on your device. External links open in your browser.
          </Text>
        </ScreenContent>
      </ScrollView>
    </Screen>
  );
}
