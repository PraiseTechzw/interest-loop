import { useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { MovieCard } from '@/components/content-cards';
import {
  DemoBanner,
  EmptyState,
  ErrorState,
  LoadingState,
  Pill,
  Screen,
  ScreenContent,
  ScreenHeader,
} from '@/components/ui';
import type { InterestId } from '@/constants/interests';
import { useInterests, useMovieFeed, useSavedMovies, useToggleSavedMovie } from '@/hooks/use-app-data';
import { space, useTheme } from '@/theme/tokens';

export default function MoviesScreen() {
  const theme = useTheme();
  const interests = useInterests();
  const movies = useMovieFeed(interests.data ?? []);
  const saved = useSavedMovies();
  const toggleSave = useToggleSavedMovie();
  const [filter, setFilter] = useState<InterestId | 'all'>('all');

  const selected = interests.data ?? [];
  const savedIds = useMemo(
    () => new Set((saved.data ?? []).map((item) => item.tmdb_id)),
    [saved.data],
  );

  const visible = useMemo(() => {
    const items = movies.data?.items ?? [];
    return filter === 'all' ? items : items.filter((movie) => movie.interest === filter);
  }, [movies.data, filter]);

  if (interests.isLoading) return <Screen><LoadingState label="Loading your interests…" /></Screen>;

  return (
    <Screen>
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
          <ScreenHeader title="Movie Night" subtitle="Picks shaped by the genres you love." />

          {selected.length > 1 ? (
            <View style={styles.filters}>
              <Pill label="All" selected={filter === 'all'} onPress={() => setFilter('all')} />
              {selected.map((id) => (
                <Pill
                  key={id}
                  label={id}
                  selected={filter === id}
                  onPress={() => setFilter(id)}
                />
              ))}
            </View>
          ) : null}

          {movies.data?.isDemo ? <DemoBanner message={movies.data.notice ?? ''} /> : null}

          {movies.isLoading ? (
            <LoadingState label="Picking the good ones…" />
          ) : movies.isError ? (
            <ErrorState message="Could not load movies." onRetry={() => movies.refetch()} />
          ) : visible.length === 0 ? (
            <EmptyState
              icon="film-outline"
              title="No matches yet"
              message="Try another genre or add more interests in your profile."
            />
          ) : (
            visible.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                saved={savedIds.has(movie.id)}
                saving={toggleSave.isPending}
                onToggleSave={() => toggleSave.mutate({ movie, saved: !savedIds.has(movie.id) })}
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
