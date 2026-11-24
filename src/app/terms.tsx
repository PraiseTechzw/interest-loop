import { Stack } from 'expo-router';
import { ScrollView, Text } from 'react-native';

import { Card, Screen, ScreenContent, ScreenHeader } from '@/components/ui';
import { useTheme } from '@/theme/tokens';

const SECTIONS = [
  {
    title: 'Using the app',
    body: 'InterestLoop is provided free for personal use. You may use it to discover and save content for your own reading and learning. Do not use it to scrape, resell or redistribute the feeds it displays.',
  },
  {
    title: 'Third-party content',
    body: 'News, movie data, artwork and discussion posts belong to their respective publishers and providers. InterestLoop links to them and does not claim ownership. TMDB attribution is shown on the Credits screen.',
  },
  {
    title: 'API keys',
    body: 'If you configure API keys, you are responsible for complying with the terms of the corresponding services, including rate limits and permitted use.',
  },
  {
    title: 'No warranty',
    body: 'The app is provided as-is. Feeds can fail or change without notice, and local data can be lost if the device storage is cleared or the app is uninstalled.',
  },
  {
    title: 'Changes',
    body: 'These terms may be updated with a new release. The current version is published in the repository at docs/TERMS.md.',
  },
];

export default function TermsScreen() {
  const theme = useTheme();
  return (
    <Screen>
      <Stack.Screen options={{ title: 'Terms' }} />
      <ScrollView>
        <ScreenContent>
          <ScreenHeader title="Terms of use" subtitle="Plain-language terms for using InterestLoop." />
          {SECTIONS.map((section) => (
            <Card key={section.title}>
              <Text style={{ color: theme.text, fontWeight: '700', fontSize: 15 }}>{section.title}</Text>
              <Text style={{ color: theme.textMuted, fontSize: 13, lineHeight: 19, marginTop: 6 }}>{section.body}</Text>
            </Card>
          ))}
        </ScreenContent>
      </ScrollView>
    </Screen>
  );
}
