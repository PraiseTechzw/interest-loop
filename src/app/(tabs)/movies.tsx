import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { MovieCard } from '@/components/content-cards';
import {
  NoticeBanner,
  EmptyState,
  ErrorState,
  LoadingState,
  Pill,
  Screen,
  ScreenContent,
  ScreenHeader,
} from '@/components/ui';
import { INTEREST_BY_ID, type InterestId } from '@/constants/interests';
import { useInterests, useMovieFeed, useSavedMovies, useToggleSavedMovie } from '@/hooks/use-app-data';
import { space, useTheme } from '@/theme/tokens';

export default function MoviesScreen() {
  const theme = useTheme();
  const interests = useInterests();
  const movies = useMovieFeed(interests.data ?? []);
  const saved = useSavedMovies();
  const toggleSave = useToggleSavedMovie();
  const [filter, setFilter] = useState<InterestId | 'all'>('all');
  const [pendingId, setPendingId] = useState<number | null>(null);

  const selected = interests.data ?? [];
  const hasTmdbKey = Boolean(process.env.EXPO_PUBLIC_TMDB_KEY?.trim());
  const noInterests = !interests.isLoading && selected.length === 0;
  const savedIds = useMemo(
    () => new Set((saved.data ?? []).map((item) => item.tmdb_id)),
    [saved.data],
  );
  const ranks = useMemo(
    () => new Map((movies.data?.items ?? []).map((movie, index) => [movie.id, index + 1])),
    [movies.data],
  );

  const visible = useMemo(() => {
    const items = movies.data?.items ?? [];
    return filter === 'all' ? items : items.filter((movie) => movie.interest === filter);
  }, [movies.data, filter]);

  if (interests.isLoading) return <Screen edges={['top']}><LoadingState label="Loading your interests…" /></Screen>;

  return (
    <Screen edges={['top']}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={movies.isFetching}
            onRefresh={() => {
              movies.refetch();
              saved.refetch();
            }}
          />
        }>
        <ScreenContent>
          <ScreenHeader
            title="Movie Night"
            subtitle="Your interests, ranked by rating and audience votes."
          />

          {selected.length > 1 ? (
            <View style={styles.filters}>
              <Pill label="All" selected={filter === 'all'} onPress={() => setFilter('all')} />
              {selected.map((id) => (
                <Pill
                  key={id}
                  label={INTEREST_BY_ID[id].short}
                  selected={filter === id}
                  onPress={() => setFilter(id)}
                />
              ))}
            </View>
          ) : null}

          {movies.data?.notice && movies.data.items.length > 0 ? (
            <NoticeBanner message={movies.data.notice} />
          ) : null}

          {movies.isLoading ? (
            <LoadingState label="Picking the good ones…" />
          ) : movies.isError || movies.data?.error ? (
            <ErrorState
              message={movies.data?.error ?? 'Could not load movies.'}
              onRetry={() => movies.refetch()}
            />
          ) : noInterests ? (
            <EmptyState
              icon="sparkles-outline"
              title="Choose your interests"
              message="Pick a few topics in your profile to get movie recommendations."
              actionLabel="Open profile"
              onAction={() => router.push('/profile')}
            />
          ) : !hasTmdbKey ? (
            <EmptyState
              icon="film-outline"
              title="No live movie source"
              message="Add EXPO_PUBLIC_TMDB_KEY to .env, then restart Expo with a cleared cache to load live picks."
              actionLabel="Open settings"
              onAction={() => router.push('/settings')}
            />
          ) : visible.length === 0 ? (
            <EmptyState
              icon="film-outline"
              title={filter === 'all' ? 'No movies found' : 'No movies in this genre'}
              message={
                filter !== 'all'
                  ? 'Nothing matched this filter. Try another interest.'
                  : (movies.data?.notice ??
                    'No movies matched your interests right now. Try selecting more interests in Profile.')
              }
              actionLabel={filter === 'all' ? undefined : 'Show all'}
              onAction={filter === 'all' ? undefined : () => setFilter('all')}
            />
          ) : (
            visible.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                rank={ranks.get(movie.id)}
                saved={savedIds.has(movie.id)}
                saving={pendingId === movie.id}
                onToggleSave={() => {
                  setPendingId(movie.id);
                  toggleSave.mutate(
                    { movie, saved: !savedIds.has(movie.id) },
                    { onSettled: () => setPendingId(null) },
                  );
                }}
              />
            ))
          )}

          <Text style={[styles.footnote, { color: theme.textMuted }]}>
            Tap the bookmark to keep a movie for later.
          </Text>
        </ScreenContent>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  filters: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: space.md },
  footnote: { fontSize: 12, textAlign: 'center', marginTop: space.lg },
});
