import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Stack, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { LoadingState, SaveButton, Screen, ScreenContent } from '@/components/ui';
import { INTEREST_BY_ID, isInterestId } from '@/constants/interests';
import { useSavedArticle, useToggleSavedArticle } from '@/hooks/use-app-data';
import { formatDate } from '@/lib/format';
import { openExternalUrl } from '@/lib/links';
import { radius, space, useTheme } from '@/theme/tokens';
import type { NewsArticle } from '@/types/models';

function parseParam(value?: string | string[]): string {
  if (Array.isArray(value)) return value[0] ?? '';
  return value ?? '';
}

export default function ArticleScreen() {
  const theme = useTheme();
  const params = useLocalSearchParams<{ url?: string; data?: string }>();
  const articleUrl = parseParam(params.url);
  const saved = useSavedArticle(articleUrl);
  const toggleSave = useToggleSavedArticle();

  let passed: NewsArticle | null = null;
  const raw = parseParam(params.data);
  if (raw) {
    try {
      passed = JSON.parse(raw) as NewsArticle;
    } catch {
      passed = null;
    }
  }

  const article: NewsArticle | null = passed ?? (saved.data
    ? {
        id: saved.data.url,
        title: saved.data.title,
        description: saved.data.description,
        content: saved.data.description,
        url: saved.data.url,
        source: saved.data.source,
        imageUrl: saved.data.image_url,
        publishedAt: saved.data.saved_at,
        interest: isInterestId(saved.data.interest_tag) ? saved.data.interest_tag : 'geek',
      }
    : null);

  const paragraphs = (article?.content || article?.description || '')
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <Screen edges={['bottom']}>
      <Stack.Screen options={{ title: 'Reader' }} />
      {!article && saved.isLoading ? (
        <LoadingState label="Opening article…" />
      ) : !article ? (
        <ScreenContent>
          <Text style={[styles.title, { color: theme.text }]}>Story unavailable</Text>
          <Text style={[styles.body, { color: theme.textMuted }]}>
            This story is no longer available offline. Open it from the News screen to read it here.
          </Text>
        </ScreenContent>
      ) : (
        <ScrollView>
          <ScreenContent>
            <Text style={[styles.tag, { color: INTEREST_BY_ID[article.interest]?.color ?? theme.primary }]}>
              {INTEREST_BY_ID[article.interest]?.label ?? 'Story'}
            </Text>
            <Text style={[styles.title, { color: theme.text }]}>{article.title}</Text>
            <View style={styles.metaRow}>
              <View style={styles.metaText}>
                <Text style={[styles.meta, { color: theme.textMuted }]}>
                  {article.source} · {formatDate(article.publishedAt)}
                </Text>
                <Text style={[styles.meta, { color: theme.textMuted }]}>
                  {Math.max(1, Math.round(paragraphs.join(' ').length / 900))} min read
                </Text>
              </View>
              <SaveButton
                saved={Boolean(saved.data)}
                busy={toggleSave.isPending}
                onPress={() => toggleSave.mutate({ article, saved: !saved.data })}
              />
            </View>

            {article.imageUrl ? (
              <Image
                source={{ uri: article.imageUrl }}
                style={styles.hero}
                contentFit="cover"
                cachePolicy="memory-disk"
              />
            ) : null}

            <View style={[styles.bodyCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              {paragraphs.length ? (
                paragraphs.map((paragraph, index) => (
                  <Text key={index} style={[styles.body, { color: theme.text, marginBottom: 14 }]}>
                    {paragraph}
                  </Text>
                ))
              ) : (
                <Text style={[styles.body, { color: theme.textMuted }]}>
                  No article text was provided by the source. Use the publisher link below to read the
                  full story.
                </Text>
              )}
            </View>

            <Text
              accessibilityRole="link"
              onPress={() => openExternalUrl(article.url)}
              style={[styles.link, { color: theme.primary }]}>
              <Ionicons name="open-outline" size={15} color={theme.primary} /> Read on publisher site ↗
            </Text>
            <Text style={[styles.note, { color: theme.textMuted }]}>
              Headlines and summaries come from the publisher. Full text is shown when the source
              provides it.
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
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 16,
  },
  metaText: { flex: 1, gap: 3 },
  meta: { fontSize: 12, fontWeight: '600' },
  hero: { width: '100%', height: 200, borderRadius: radius.md, marginBottom: space.lg },
  bodyCard: { borderWidth: 1, borderRadius: radius.lg, padding: space.lg },
  body: { fontSize: 16, lineHeight: 26 },
  link: { fontSize: 14, fontWeight: '700', marginTop: 20 },
  note: { fontSize: 12, lineHeight: 18, marginTop: 12 },
});
