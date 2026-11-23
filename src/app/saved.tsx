import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Card, EmptyState, Pill, Screen, ScreenContent, ScreenHeader, SectionHeader } from '@/components/ui';
import { INTEREST_BY_ID } from '@/constants/interests';
import {
  useSavedArticles,
  useSavedDiscovery,
  useSavedMovies,
  useToggleSavedArticle,
  useToggleSavedDiscovery,
  useToggleSavedMovie,
} from '@/hooks/use-app-data';
import { formatDate, truncate } from '@/lib/format';
import { openExternalUrl } from '@/lib/links';
import { radius, space, useTheme } from '@/theme/tokens';
import type { NewsArticle } from '@/types/models';

type Tab = 'articles' | 'movies' | 'finds';

export default function SavedScreen() {
  const theme = useTheme();
  const [tab, setTab] = useState<Tab>('articles');
  const articles = useSavedArticles();
  const movies = useSavedMovies();
  const discovery = useSavedDiscovery();
  const removeArticle = useToggleSavedArticle();
  const removeMovie = useToggleSavedMovie();
  const removeDiscovery = useToggleSavedDiscovery();

  const tabs = useMemo(
    () => [
      { id: 'articles' as const, label: `Articles (${articles.data?.length ?? 0})` },
      { id: 'movies' as const, label: `Movies (${movies.data?.length ?? 0})` },
      { id: 'finds' as const, label: `Finds (${discovery.data?.length ?? 0})` },
    ],
    [articles.data, movies.data, discovery.data],
  );

  const isBusy =
    removeArticle.isPending || removeMovie.isPending || removeDiscovery.isPending;

  return (
    <Screen>
      <ScrollView>
        <ScreenContent>
          <ScreenHeader
            title="Saved for later"
            subtitle="Everything here is stored on your device and works offline."
          />

          <View style={styles.tabs}>
            {tabs.map((item) => (
              <Pill
                key={item.id}
                label={item.label}
                selected={tab === item.id}
                onPress={() => setTab(item.id)}
              />
            ))}
          </View>

          {tab === 'articles' ? (
            <>
              <SectionHeader title="Articles" />
              {(articles.data ?? []).length === 0 ? (
                <EmptyState
                  icon="bookmark-outline"
                  title="No saved articles"
                  message="Tap the bookmark on any story to keep it here for offline reading."
                />
              ) : (
                articles.data!.map((item) => {
                  const interest = INTEREST_BY_ID[item.interest_tag as keyof typeof INTEREST_BY_ID];
                  const article: NewsArticle = {
                    id: item.url,
                    title: item.title,
                    description: item.description,
                    url: item.url,
                    source: item.source,
                    imageUrl: item.image_url,
                    publishedAt: item.saved_at,
                    interest: interest?.id ?? 'geek',
                  };
                  return (
                    <Card key={item.id}>
                      <Text style={[styles.meta, { color: interest?.color ?? theme.primary }]}>
                        {interest?.short ?? 'Saved'}
                      </Text>
                      <Text style={[styles.title, { color: theme.text }]}>{item.title}</Text>
                      <Text style={[styles.meta, { color: theme.textMuted }]}>
                        {item.source} · saved {formatDate(item.saved_at)}
                      </Text>
                      <View style={styles.actions}>
                        <Text
                          accessibilityRole="link"
                          onPress={() => openExternalUrl(item.url)}
                          style={{ color: theme.primary, fontWeight: '700', fontSize: 13 }}>
                          Read story →
                        </Text>
                        <Text
                          accessibilityRole="button"
                          onPress={() =>
                            removeArticle.mutate({ article, saved: false })
                          }
                          style={{ color: theme.danger, fontWeight: '600', fontSize: 13 }}>
                          {isBusy ? 'Removing…' : 'Remove'}
                        </Text>
                      </View>
                    </Card>
                  );
                })
              )}
            </>
          ) : null}

          {tab === 'movies' ? (
            <>
              <SectionHeader title="Movies" />
              {(movies.data ?? []).length === 0 ? (
                <EmptyState
                  icon="film-outline"
                  title="No saved movies"
                  message="Bookmark a movie and it will show up here."
                />
              ) : (
                movies.data!.map((movie) => (
                  <Card key={movie.id}>
                    <View style={styles.row}>
                      <View style={[styles.iconBox, { backgroundColor: theme.primarySoft }]}>
                        <Ionicons name="film-outline" size={20} color={theme.primary} />
                      </View>
                      <View style={styles.flex}>
                        <Text style={[styles.title, { color: theme.text }]}>{movie.title}</Text>
                        <Text style={[styles.meta, { color: theme.textMuted }]}>
                          ⭐ {movie.vote_average.toFixed(1)} · saved {formatDate(movie.saved_at)}
                        </Text>
                        <Text
                          accessibilityRole="button"
                          onPress={() => removeMovie.mutate({ movie: movieFromRow(movie), saved: false })}
                          style={{ color: theme.danger, fontWeight: '600', fontSize: 13, marginTop: 8 }}>
                          {isBusy ? 'Removing…' : 'Remove'}
                        </Text>
                      </View>
                    </View>
                  </Card>
                ))
              )}
            </>
          ) : null}

          {tab === 'finds' ? (
            <>
              <SectionHeader title="Discovery finds" />
              {(discovery.data ?? []).length === 0 ? (
                <EmptyState
                  icon="compass-outline"
                  title="No saved finds"
                  message="Bookmark something from Discover to keep it here."
                />
              ) : (
                discovery.data!.map((item) => (
                  <Card key={item.id}>
                    <Text style={[styles.meta, { color: theme.primary }]}>{item.source}</Text>
                    <Text style={[styles.title, { color: theme.text }]}>{truncate(item.title, 90)}</Text>
                    <View style={styles.actions}>
                      <Text
                        accessibilityRole="link"
                        onPress={() => openExternalUrl(item.url)}
                        style={{ color: theme.primary, fontWeight: '700', fontSize: 13 }}>
                        Open link →
                      </Text>
                      <Text
                        accessibilityRole="button"
                        onPress={() => removeDiscovery.mutate({ item: discoveryFromRow(item), saved: false })}
                        style={{ color: theme.danger, fontWeight: '600', fontSize: 13 }}>
                        {isBusy ? 'Removing…' : 'Remove'}
                      </Text>
                    </View>
                  </Card>
                ))
              )}
            </>
          ) : null}
        </ScreenContent>
      </ScrollView>
    </Screen>
  );
}

function movieFromRow(row: {
  tmdb_id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  vote_average: number;
  genre: string;
}) {
  return {
    id: row.tmdb_id,
    title: row.title,
    overview: row.overview,
    posterPath: row.poster_path,
    rating: row.vote_average,
    voteCount: 0,
    genreIds: row.genre.split(',').filter(Boolean).map(Number),
    releaseDate: '',
    interest: 'geek' as const,
  };
}

function discoveryFromRow(row: {
  id: string;
  title: string;
  url: string;
  excerpt: string;
  source: string;
  score: number;
}) {
  return {
    id: row.id,
    title: row.title,
    url: row.url,
    excerpt: row.excerpt,
    source: (row.source === 'reddit' || row.source === 'hacker-news'
      ? row.source
      : 'curated') as 'reddit' | 'hacker-news' | 'curated',
    score: row.score,
    age: '',
    type: 'article' as const,
    interest: 'problem-solving' as const,
  };
}

const styles = StyleSheet.create({
  tabs: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: space.lg },
  row: { flexDirection: 'row', gap: space.md },
  flex: { flex: 1 },
  iconBox: { width: 40, height: 40, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 15, fontWeight: '700', lineHeight: 21, marginVertical: 5 },
  meta: { fontSize: 11, fontWeight: '600' },
  actions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
});
