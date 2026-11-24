import { ScrollView, Text } from 'react-native';

import { Card, NoticeBanner, Screen, ScreenContent, ScreenHeader, SectionHeader } from '@/components/ui';
import { openExternalUrl } from '@/lib/links';
import { useTheme } from '@/theme/tokens';

const SECTIONS = [
  {
    title: 'What is stored on your device',
    body: 'Interests, saved articles, movies and discoveries, your own mindset prompts, reflections and learning progress are stored in a local SQLite database. There is no account and no server sync.',
  },
  {
    title: 'What leaves your device',
    body: 'When you open a feed, the app requests data from NewsAPI, FreeNewsApi, TMDB, Hacker News and Reddit. These requests include your selected interest keywords and standard device connection information. The app does not send your saved items or reflections to these services.',
  },
  {
    title: 'Links and trailers',
    body: 'Opening a story, discussion or trailer takes you to an external website in your browser. Their privacy practices are their own.',
  },
  {
    title: 'Your controls',
    body: 'Settings → Clear local data removes saved content, prompts, reflections and progress from this device. You can also remove items individually from the Saved screen.',
  },
];

export default function PrivacyScreen() {
  const theme = useTheme();
  const privacyUrl = process.env.EXPO_PUBLIC_PRIVACY_URL?.trim();

  return (
    <Screen>
      <ScrollView>
        <ScreenContent>
          <ScreenHeader
            title="Privacy"
            subtitle="A plain-language summary of how InterestLoop handles data."
          />

          {privacyUrl ? (
            <NoticeBanner message="A hosted privacy policy is configured. Open it from Settings." />
          ) : (
            <NoticeBanner message="For store submission, publish a hosted privacy policy and set EXPO_PUBLIC_PRIVACY_URL." />
          )}

          {SECTIONS.map((section) => (
            <Card key={section.title}>
              <SectionHeader title={section.title} />
              <Text style={{ color: theme.textMuted, fontSize: 13, lineHeight: 19 }}>
                {section.body}
              </Text>
            </Card>
          ))}

          {privacyUrl ? (
            <Text
              accessibilityRole="link"
              onPress={() => openExternalUrl(privacyUrl)}
              style={{ color: theme.primary, fontWeight: '700', fontSize: 13, marginTop: 12 }}>
              Open full privacy policy →
            </Text>
          ) : null}
        </ScreenContent>
      </ScrollView>
    </Screen>
  );
}
