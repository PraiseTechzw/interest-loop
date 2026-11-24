import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Card, EmptyState, Pill, Screen, ScreenContent, ScreenHeader, SectionHeader } from '@/components/ui';
import {
  useRemoveNote,
  useSavedArticles,
  useSavedDiscovery,
  useSavedMovies,
  useSavedNotes,
  useToggleSavedArticle,
  useToggleSavedDiscovery,
  useToggleSavedMovie,
} from '@/hooks/use-app-data';
import { formatCount, formatDate } from '@/lib/format';
import { getInterest } from '@/lib/interest-catalogue';
import { openExternalUrl } from '@/lib/links';
import { radius, space, useTheme } from '@/theme/tokens';
import type { NewsArticle } from '@/types/models';

type Tab = 'articles' | 'movies' | 'finds' | 'notes';

export default function SavedScreen() {
  const theme = useTheme();
  const [tab, setTab] = useState<Tab>('articles');
  const articles = useSavedArticles();
  const movies = useSavedMovies();
  const discovery = useSavedDiscovery();
  const notes = useSavedNotes();
  const removeArticle = useToggleSavedArticle();
  const removeMovie = useToggleSavedMovie();
  const removeDiscovery = useToggleSavedDiscovery();
  const removeNote = useRemoveNote();

  const tabs = useMemo(
    () => [
      { id: 'articles' as const, label: `Articles (${articles.data?.length ?? 0})` },
      { id: 'movies' as const, label: `Movies (${movies.data?.length ?? 0})` },
      { id: 'finds' as const, label: `Finds (${discovery.data?.length ?? 0})` },
      { id: 'notes' as const, label: `My notes (${notes.data?.length ?? 0})` },
    ],
    [articles.data, movies.data, discovery.data, notes.data],
  );

  const isBusy =
    removeArticle.isPending || removeMovie.isPending || removeDiscovery.isPending || removeNote.isPending;

  return (
    <Screen>
      <ScrollView>
        <ScreenContent>
          <ScreenHeader
            title="Saved for later"
            subtitle="Kept on this device, so you can read it without a connection."
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
                  const interest = getInterest(item.interest_tag);
                  const article: NewsArticle = {
                    id: item.url,
                    title: item.title,
                    description: item.description,
                    url: item.url,
                    source: item.source,
                    imageUrl: item.image_url,
                    publishedAt: item.saved_at,
                    interest: item.interest_tag || 'geek',
                  };
                  return (
                    <Card key={item.id}>
                      <Text style={[styles.meta, { color: interest.color }]}>{interest.short}</Text>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Read ${item.title}`}
                        onPress={() =>
                          router.push({ pathname: '/article/[url]', params: { url: item.url } })
                        }>
                        <Text style={[styles.title, { color: theme.text }]}>{item.title}</Text>
                      </Pressable>
                      <Text style={[styles.meta, { color: theme.textMuted }]}>
                        {item.source} · saved {formatDate(item.saved_at)}
                      </Text>
                      {item.description ? (
                        <Text numberOfLines={3} style={[styles.excerpt, { color: theme.textMuted }]}>
                          {item.description}
                        </Text>
                      ) : null}
                      <View style={styles.actions}>
                        <Text
                          accessibilityRole="link"
                          onPress={() => openExternalUrl(item.url)}
                          style={[styles.link, { color: theme.primary }]}>
                          <Ionicons name="open-outline" size={13} color={theme.primary} /> Publisher
                        </Text>
                        <Text
                          accessibilityRole="button"
                          onPress={() => removeArticle.mutate({ article, saved: false })}
                          style={[styles.link, { color: theme.danger }]}>
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
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={`View ${movie.title}`}
                          onPress={() => router.push(`/movie/${movie.tmdb_id}`)}>
                          <Text style={[styles.title, { color: theme.text }]}>{movie.title}</Text>
                        </Pressable>
                        <Text style={[styles.meta, { color: theme.textMuted }]}>
                          <Ionicons name="star" size={12} color={theme.accent} />{' '}
                          {movie.vote_average.toFixed(1)} · {formatCount(movie.vote_count)} votes ·
                          saved {formatDate(movie.saved_at)}
                        </Text>
                        <Text
                          accessibilityRole="button"
                          onPress={() => removeMovie.mutate({ movie: movieFromRow(movie), saved: false })}
                          style={[styles.link, { color: theme.danger, marginTop: 8 }]}>
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
                    <Text numberOfLines={3} style={[styles.title, { color: theme.text }]}>
                      {item.title}
                    </Text>
                    {item.excerpt ? (
                      <Text numberOfLines={3} style={[styles.excerpt, { color: theme.textMuted }]}>
                        {item.excerpt}
                      </Text>
                    ) : null}
                    <View style={styles.actions}>
                      <Text
                        accessibilityRole="link"
                        onPress={() => openExternalUrl(item.url)}
                        style={[styles.link, { color: theme.primary }]}>
                        <Ionicons name="open-outline" size={13} color={theme.primary} /> Source
                      </Text>
                      <Text
                        accessibilityRole="button"
                        onPress={() => removeDiscovery.mutate({ item: discoveryFromRow(item), saved: false })}
                        style={[styles.link, { color: theme.danger }]}>
                        {isBusy ? 'Removing…' : 'Remove'}
                      </Text>
                    </View>
                  </Card>
                ))
              )}
            </>
          ) : null}

          {tab === 'notes' ? (
            <>
              <SectionHeader
                title="My notes"
                actionLabel="New note"
                onAction={() => router.push('/capture')}
              />
              {(notes.data ?? []).length === 0 ? (
                <EmptyState
                  icon="create-outline"
                  title="Nothing captured yet"
                  message="Write down an idea, a link or something you want to remember. It stays on this device."
                  actionLabel="Capture a thought"
                  onAction={() => router.push('/capture')}
                />
              ) : (
                notes.data!.map((note) => {
                  const interest = getInterest(note.interest_tag);
                  return (
                    <Card key={note.id}>
                      <Text style={[styles.meta, { color: interest.color }]}>{interest.label}</Text>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Edit ${note.title}`}
                        onPress={() => router.push({ pathname: '/capture', params: { id: note.id } })}>
                        <Text style={[styles.title, { color: theme.text }]}>{note.title}</Text>
                      </Pressable>
                      {note.body ? (
                        <Text numberOfLines={4} style={[styles.excerpt, { color: theme.textMuted }]}>
                          {note.body}
                        </Text>
                      ) : null}
                      <Text style={[styles.meta, { color: theme.textMuted }]}>
                        Updated {formatDate(note.updated_at)}
                      </Text>
                      <View style={styles.actions}>
                        {note.url ? (
                          <Text
                            accessibilityRole="link"
                            onPress={() => openExternalUrl(note.url)}
                            style={[styles.link, { color: theme.primary }]}>
                            <Ionicons name="open-outline" size={13} color={theme.primary} /> Link
                          </Text>
                        ) : (
                          <Text />
                        )}
                        <Text
                          accessibilityRole="button"
                          onPress={() => removeNote.mutate(note.id)}
                          style={[styles.link, { color: theme.danger }]}>
                          {isBusy ? 'Removing…' : 'Remove'}
                        </Text>
                      </View>
                    </Card>
                  );
                })
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
  vote_count: number;
  genre: string;
  release_date: string;
  interest_tag: string;
}) {
  return {
    id: row.tmdb_id,
    title: row.title,
    overview: row.overview,
    posterPath: row.poster_path,
    rating: row.vote_average,
    voteCount: row.vote_count,
    genreIds: row.genre.split(',').filter(Boolean).map(Number),
    releaseDate: row.release_date,
    interest: row.interest_tag || 'geek',
  };
}

function discoveryFromRow(row: {
  id: string;
  title: string;
  url: string;
  excerpt: string;
  source: string;
  score: number;
  interest_tag: string;
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
    interest: row.interest_tag || 'problem-solving',
  };
}

const styles = StyleSheet.create({
  tabs: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: space.lg },
  row: { flexDirection: 'row', gap: space.md },
  flex: { flex: 1 },
  iconBox: { width: 40, height: 40, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 15, fontWeight: '700', lineHeight: 21, marginVertical: 5 },
  meta: { fontSize: 11, fontWeight: '600' },
  excerpt: { fontSize: 13, lineHeight: 19, marginBottom: 6 },
  actions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  link: { fontSize: 13, fontWeight: '600', flexDirection: 'row', alignItems: 'center', gap: 4 },
});
