import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Stack, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Card, LoadingState, Screen, ScreenContent, ScreenHeader, SectionHeader } from '@/components/ui';
import { INTEREST_BY_ID, isInterestId } from '@/constants/interests';
import { space, useTheme } from '@/theme/tokens';
import { useInterests, useSavedMovie } from '@/hooks/use-app-data';
import { fetchMovieById } from '@/services/movies';
import { useQuery } from '@tanstack/react-query';
import { openExternalUrl } from '@/lib/links';
import type { Movie } from '@/types/models';

export default function MovieDetailScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const tmdbId = Number(id);
  const saved = useSavedMovie(tmdbId);
  const interests = useInterests();

  const live = useQuery({
    queryKey: ['movie-detail', tmdbId],
    queryFn: () => fetchMovieById(tmdbId, interests.data ?? []),
    enabled: Number.isFinite(tmdbId) && tmdbId > 0 && !saved.data,
  });

  const movie: Movie | null = saved.data
    ? {
        id: saved.data.tmdb_id,
        title: saved.data.title,
        overview: saved.data.overview,
        posterPath: saved.data.poster_path,
        rating: saved.data.vote_average,
        voteCount: 0,
        genreIds: saved.data.genre.split(',').filter(Boolean).map(Number),
        releaseDate: '',
        interest: 'geek',
      }
    : live.data ?? null;

  const isLoading = saved.isLoading || (!saved.data && live.isLoading);

  const trailerUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(
    `${movie?.title ?? ''} official trailer`,
  )}`;

  return (
    <Screen>
      <Stack.Screen options={{ title: 'Movie' }} />
      {isLoading ? (
        <LoadingState label="Loading movie…" />
      ) : !movie ? (
        <ScreenContent>
          <ScreenHeader title="Movie not found" subtitle="Open a movie from the Movies screen." />
        </ScreenContent>
      ) : (
        <ScrollView>
          <ScreenContent>
            <View style={styles.header}>
              {movie.posterPath ? (
                <Image
                  source={{ uri: `https://image.tmdb.org/t/p/w500${movie.posterPath}` }}
                  style={styles.poster}
                  contentFit="cover"
                />
              ) : (
                <View style={[styles.posterFallback, { backgroundColor: theme.primarySoft }]}>
                  <Ionicons name="film-outline" size={36} color={theme.primary} />
                </View>
              )}
              <View style={styles.headerText}>
                <Text style={[styles.title, { color: theme.text }]}>{movie.title}</Text>
                <Text style={[styles.meta, { color: theme.textMuted }]}>
                  ⭐ {movie.rating.toFixed(1)} · {movie.releaseDate.slice(0, 4) || '—'}
                </Text>
                <Text style={[styles.interest, { color: INTEREST_BY_ID[movie.interest].color }]}>
                  {isInterestId(movie.interest) ? INTEREST_BY_ID[movie.interest].label : movie.interest}
                </Text>
              </View>
            </View>

            <View style={styles.actions}>
              <Card>
                <Text
                  accessibilityRole="link"
                  onPress={() => openExternalUrl(trailerUrl)}
                  style={{ color: theme.primary, fontWeight: '700' }}>
                  ▶ Watch trailer
                </Text>
              </Card>
            </View>

            <SectionHeader title="Synopsis" />
            <Card>
              <Text style={[styles.body, { color: theme.text }]}>
                {movie.overview || 'No synopsis is available for this movie.'}
              </Text>
            </Card>

            {saved.data ? (
              <Card>
                <Text style={{ color: theme.textMuted, fontSize: 12 }}>
                  Saved on this device — available offline.
                </Text>
              </Card>
            ) : null}
          </ScreenContent>
        </ScrollView>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', gap: space.lg, marginTop: 8 },
  poster: { width: 120, height: 180, borderRadius: 12 },
  posterFallback: { width: 120, height: 180, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  headerText: { flex: 1 },
  title: { fontSize: 22, fontWeight: '800', lineHeight: 29 },
  meta: { fontSize: 13, marginTop: 8 },
  interest: { fontSize: 12, fontWeight: '700', marginTop: 8 },
  actions: { marginTop: space.lg },
  body: { fontSize: 15, lineHeight: 23 },
});
