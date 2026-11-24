import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Card, LoadingState, Screen, ScreenContent, ScreenHeader } from '@/components/ui';
import { INTEREST_BY_ID, isInterestId } from '@/constants/interests';
import { useSavedArticle, useToggleSavedArticle } from '@/hooks/use-app-data';
import { formatDate } from '@/lib/format';
import { openExternalUrl } from '@/lib/links';
import { SaveButton } from '@/components/ui';
import { useTheme } from '@/theme/tokens';
import type { NewsArticle } from '@/types/models';

export default function ArticleScreen() {
  const theme = useTheme();
  const { url } = useLocalSearchParams<{ url: string }>();
  const articleUrl = Array.isArray(url) ? url[0] : url ?? '';
  const saved = useSavedArticle(articleUrl);
  const toggleSave = useToggleSavedArticle();

  const article: NewsArticle | null = saved.data
    ? {
        id: saved.data.url,
        title: saved.data.title,
        description: saved.data.description,
        url: saved.data.url,
        source: saved.data.source,
        imageUrl: saved.data.image_url,
        publishedAt: saved.data.saved_at,
        interest: isInterestId(saved.data.interest_tag) ? saved.data.interest_tag : 'geek',
      }
    : null;

  return (
    <Screen>
      <Stack.Screen options={{ title: 'Read' }} />
      {saved.isLoading ? (
        <LoadingState label="Opening article…" />
      ) : !article ? (
        <ScreenContent>
          <ScreenHeader title="Article not saved" subtitle="This story is not in your offline library." />
          <Card>
            <Text style={{ color: theme.textMuted, lineHeight: 20 }}>
              Only saved articles have a full offline reader. Save a story from the News screen to read it here.
            </Text>
          </Card>
        </ScreenContent>
      ) : (
        <ScrollView>
          <ScreenContent>
            <Text style={[styles.tag, { color: INTEREST_BY_ID[article.interest].color }]}>
              {INTEREST_BY_ID[article.interest].label}
            </Text>
            <Text style={[styles.title, { color: theme.text }]}>{article.title}</Text>
            <View style={styles.metaRow}>
              <Text style={[styles.meta, { color: theme.textMuted }]}>
                {article.source} · {formatDate(article.publishedAt)}
              </Text>
              <SaveButton
                saved
                busy={toggleSave.isPending}
                onPress={() => toggleSave.mutate({ article, saved: false })}
              />
            </View>
            <Card>
              <Text style={[styles.body, { color: theme.text }]}>{article.description || 'No description was saved with this article.'}</Text>
            </Card>
            <Text
              accessibilityRole="link"
              onPress={() => openExternalUrl(article.url)}
              style={[styles.link, { color: theme.primary }]}>
              Read the full story online →
            </Text>
            <Text style={[styles.note, { color: theme.textMuted }]}>
              Offline reader shows the saved summary. The full article lives on the publisher’s website.
            </Text>
          </ScreenContent>
        </ScrollView>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  tag: { fontSize: 12, fontWeight: '700', marginTop: 8 },
  title: { fontSize: 26, fontWeight: '800', lineHeight: 33, marginTop: 8 },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, marginBottom: 16 },
  meta: { fontSize: 12, fontWeight: '600' },
  body: { fontSize: 16, lineHeight: 25 },
  link: { fontSize: 14, fontWeight: '700', marginTop: 20 },
  note: { fontSize: 12, lineHeight: 18, marginTop: 12 },
});
