import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { useConnectivity } from '@/components/connectivity-provider';
import {
  Card,
  LoadingState,
  SaveButton,
  Screen,
  ScreenContent,
  SectionHeader,
} from '@/components/ui';
import { useInterests, useSavedMovie, useToggleSavedMovie } from '@/hooks/use-app-data';
import { formatCount, formatRating } from '@/lib/format';
import { getInterest } from '@/lib/interest-catalogue';
import { openExternalUrl } from '@/lib/links';
import { fetchMovieById, fetchMovieTrailer } from '@/services/movies';
import { radius, space, useTheme } from '@/theme/tokens';
import type { Movie } from '@/types/models';

export default function MovieDetailScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const tmdbId = Number(id);
  const valid = Number.isFinite(tmdbId) && tmdbId > 0;
  const isWeb = process.env.EXPO_OS === 'web';
  const { isOffline } = useConnectivity();
  const interests = useInterests();
  const saved = useSavedMovie(tmdbId);
  const toggleSave = useToggleSavedMovie();
  const [trailerOpen, setTrailerOpen] = useState(false);

  // Always refresh live details so saved movies also get genres, runtime and a trailer.
  const live = useQuery({
    queryKey: ['movie-detail', tmdbId],
    queryFn: () => fetchMovieById(tmdbId, interests.data ?? []),
    enabled: valid && !isOffline,
    staleTime: 24 * 60 * 60 * 1000,
  });
  const trailer = useQuery({
    queryKey: ['movie-trailer', tmdbId],
    queryFn: () => fetchMovieTrailer(tmdbId),
    enabled: valid && !isOffline && !saved.data,
    staleTime: 7 * 24 * 60 * 60 * 1000,
  });

  const offline: Movie | null = saved.data
    ? {
        id: saved.data.tmdb_id,
        title: saved.data.title,
        overview: saved.data.overview,
        posterPath: saved.data.poster_path,
        rating: saved.data.vote_average,
        voteCount: saved.data.vote_count,
        genreIds: saved.data.genre.split(',').filter(Boolean).map(Number),
        releaseDate: saved.data.release_date,
        interest: saved.data.interest_tag || 'geek',
      }
    : null;
  const movie = live.data ?? offline;
  const isLoading = !offline && (live.isLoading || saved.isLoading);
  const backdrop = movie?.backdropPath
    ? `https://image.tmdb.org/t/p/w780${movie.backdropPath}`
    : null;
  const year = movie?.releaseDate?.slice(0, 4);
  const interest = movie ? getInterest(movie.interest) : null;

  return (
    <Screen edges={['bottom']}>
      <Stack.Screen options={{ title: movie?.title ?? 'Movie' }} />
      {isLoading ? (
        <LoadingState label="Loading movie…" />
      ) : !movie ? (
        <ScreenContent>
          <Text style={[styles.title, { color: theme.text }]}>Movie not found</Text>
          <Text style={[styles.body, { color: theme.textMuted }]}>
            Open a movie from the Movies screen to see its details here.
          </Text>
        </ScreenContent>
      ) : (
        <ScrollView>
          {backdrop ? (
            <View style={styles.backdropWrap}>
              <Image source={{ uri: backdrop }} style={styles.backdrop} contentFit="cover" />
              <View style={[styles.backdropShade, { backgroundColor: theme.overlay }]} />
            </View>
          ) : null}

          <ScreenContent style={backdrop ? styles.contentOverBackdrop : undefined}>
            <View style={styles.header}>
              {movie.posterPath ? (
                <Image
                  source={{ uri: `https://image.tmdb.org/t/p/w342${movie.posterPath}` }}
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
                {movie.tagline ? (
                  <Text style={[styles.tagline, { color: theme.textMuted }]}>
                    “{movie.tagline}”
                  </Text>
                ) : null}
                <Text style={[styles.meta, { color: theme.textMuted }]}>
                  <Ionicons name="star" size={13} color={theme.accent} /> {formatRating(movie.rating)} ·{' '}
                  {formatCount(movie.voteCount)} votes
                </Text>
                <Text style={[styles.meta, { color: theme.textMuted }]}>
                  {year || 'Year unknown'}
                  {movie.runtime ? ` · ${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : ''}
                </Text>
              </View>
              <SaveButton
                saved={Boolean(saved.data)}
                busy={toggleSave.isPending}
                onPress={() => toggleSave.mutate({ movie, saved: !saved.data })}
              />
            </View>

            {interest ? (
              <Text style={[styles.interest, { color: interest.color }]}>
                {interest.label}
              </Text>
            ) : null}

            {movie.genres?.length ? (
              <View style={styles.genres}>
                {movie.genres.map((genre) => (
                  <View key={genre} style={[styles.genre, { backgroundColor: theme.primarySoft }]}>
                    <Text style={[styles.genreText, { color: theme.primary }]}>{genre}</Text>
                  </View>
                ))}
              </View>
            ) : null}

            <SectionHeader title="Synopsis" />
            <Card>
              <Text style={[styles.body, { color: theme.text }]}>
                {movie.overview || 'No synopsis is available for this movie.'}
              </Text>
            </Card>

            {trailer.data || trailer.isLoading ? (
              <>
                <SectionHeader title="Trailer" />
                <Card>
                  {trailer.data ? (
                    trailerOpen && !isWeb ? (
                      <WebView
                        source={{ uri: `https://www.youtube.com/embed/${trailer.data}?autoplay=1&rel=0` }}
                        style={styles.webview}
                        allowsInlineMediaPlayback
                        mediaPlaybackRequiresUserAction={false}
                      />
                    ) : (
                      <Pressable
                        accessibilityRole="button"
                        onPress={() =>
                          isWeb
                            ? openExternalUrl(`https://www.youtube.com/watch?v=${trailer.data}`)
                            : setTrailerOpen(true)
                        }
                        style={styles.play}>
                        <Ionicons name="play-circle" size={22} color={theme.primary} />
                        <Text style={[styles.playLabel, { color: theme.primary }]}>
                          {isWeb ? 'Watch official trailer ↗' : 'Play official trailer'}
                        </Text>
                      </Pressable>
                    )
                  ) : (
                    <LoadingState label="Finding trailer…" />
                  )}
                </Card>
              </>
            ) : (
              <Text
                accessibilityRole="link"
                onPress={() =>
                  openExternalUrl(
                    `https://www.youtube.com/results?search_query=${encodeURIComponent(
                      `${movie.title} official trailer`,
                    )}`,
                  )
                }
                style={[styles.link, { color: theme.primary }]}>
                Search for trailer ↗
              </Text>
            )}
          </ScreenContent>
        </ScrollView>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  backdropWrap: { height: 190, position: 'relative' },
  backdrop: { width: '100%', height: '100%' },
  backdropShade: { ...StyleSheet.absoluteFill, opacity: 0.35 },
  contentOverBackdrop: { marginTop: -46 },
  header: { flexDirection: 'row', gap: space.md, alignItems: 'flex-start' },
  poster: { width: 104, height: 156, borderRadius: radius.md },
  posterFallback: {
    width: 104,
    height: 156,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: { flex: 1 },
  title: { fontSize: 22, fontWeight: '800', lineHeight: 28 },
  tagline: { fontSize: 13, fontStyle: 'italic', marginTop: 6, lineHeight: 19 },
  meta: { fontSize: 12, marginTop: 8 },
  interest: { fontSize: 12, fontWeight: '700', marginTop: space.md },
  genres: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: space.sm, marginBottom: space.lg },
  genre: { borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 5 },
  genreText: { fontSize: 11, fontWeight: '700' },
  body: { fontSize: 15, lineHeight: 23 },
  play: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 12 },
  playLabel: { fontSize: 14, fontWeight: '700' },
  webview: { height: 220, borderRadius: radius.sm },
  link: { fontSize: 14, fontWeight: '700', marginTop: space.lg },
});
