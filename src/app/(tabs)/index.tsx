import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { DiscoveryCard, MovieCard, NewsCard } from '@/components/content-cards';
import { DemoBanner, EmptyState, LoadingState, Screen, ScreenContent, ScreenHeader, SectionHeader } from '@/components/ui';
import { INTEREST_BY_ID } from '@/constants/interests';
import {
  useDiscoveryFeed,
  useInterests,
  useMovieFeed,
  useNews,
  useSavedArticles,
  useSavedDiscovery,
  useSavedMovies,
  useToggleSavedArticle,
  useToggleSavedDiscovery,
  useToggleSavedMovie,
} from '@/hooks/use-app-data';
import { radius, space, useTheme } from '@/theme/tokens';

export default function HomeScreen() {
  const theme = useTheme();
  const interests = useInterests();
  const news = useNews(interests.data ?? []);
  const movies = useMovieFeed(interests.data ?? []);
  const discovery = useDiscoveryFeed();
  const savedArticles = useSavedArticles();
  const savedMovies = useSavedMovies();
  const savedDiscovery = useSavedDiscovery();
  const toggleArticle = useToggleSavedArticle();
  const toggleMovie = useToggleSavedMovie();
  const toggleDiscovery = useToggleSavedDiscovery();

  const selected = interests.data ?? [];
  const isLoading = interests.isLoading || news.isLoading || movies.isLoading;

  const refreshing =
    news.isFetching || movies.isFetching || discovery.isFetching || interests.isFetching;

  const refresh = useCallback(() => {
    news.refetch();
    movies.refetch();
    discovery.refetch();
    interests.refetch();
  }, [news, movies, discovery, interests]);

  const savedArticleUrls = new Set((savedArticles.data ?? []).map((item) => item.url));
  const savedMovieIds = new Set((savedMovies.data ?? []).map((item) => item.tmdb_id));
  const savedDiscoveryIds = new Set((savedDiscovery.data ?? []).map((item) => item.id));

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}>
        <ScreenContent>
          <ScreenHeader
            title="InterestLoop"
            subtitle="A daily loop through the things you actually care about."
          />

          <View style={[styles.hero, { backgroundColor: theme.primary }]}>
            <Ionicons name="sparkles" size={22} color={theme.onPrimary} />
            <Text style={[styles.heroTitle, { color: theme.onPrimary }]}>Your interests</Text>
            <Text style={[styles.heroSubtitle, { color: theme.onPrimary }]}>
              {selected.length > 0
                ? 'Tap a pill in Profile to reshape your feed.'
                : 'Pick a few interests in Profile to get started.'}
            </Text>
            <View style={styles.heroPills}>
              {selected.slice(0, 5).map((id) => (
                <View key={id} style={styles.heroPill}>
                  <Text style={{ color: theme.onPrimary, fontSize: 12, fontWeight: '700' }}>
                    {INTEREST_BY_ID[id].short}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.actions}>
            <Pressable
              onPress={() => router.push('/coach')}
              accessibilityRole="button"
              style={[styles.action, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Ionicons name="bulb-outline" size={22} color={theme.accent} />
              <Text style={[styles.actionLabel, { color: theme.text }]}>Coach</Text>
            </Pressable>
            <Pressable
              onPress={() => router.push('/graph')}
              accessibilityRole="button"
              style={[styles.action, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Ionicons name="git-network-outline" size={22} color={theme.primary} />
              <Text style={[styles.actionLabel, { color: theme.text }]}>Graph</Text>
            </Pressable>
            <Pressable
              onPress={() => router.push('/saved')}
              accessibilityRole="button"
              style={[styles.action, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Ionicons name="bookmark-outline" size={22} color={theme.success} />
              <Text style={[styles.actionLabel, { color: theme.text }]}>Saved</Text>
            </Pressable>
          </View>

          {news.data?.isDemo ? <DemoBanner message={news.data.notice ?? ''} /> : null}

          <SectionHeader title="Top stories" actionLabel="All news" onAction={() => router.push('/news')} />
          {isLoading || !news.data ? (
            <LoadingState label="Gathering your stories…" />
          ) : news.data.items.length === 0 ? (
            <EmptyState
              title="Nothing here yet"
              message="Select a few interests in your profile and we'll find stories for you."
              actionLabel="Open profile"
              onAction={() => router.push('/profile')}
            />
          ) : (
            news.data.items.slice(0, 2).map((article) => (
              <NewsCard
                key={article.id}
                article={article}
                compact
                saved={savedArticleUrls.has(article.url)}
                saving={toggleArticle.isPending}
                onToggleSave={() =>
                  toggleArticle.mutate({
                    article,
                    saved: !savedArticleUrls.has(article.url),
                  })
                }
              />
            ))
          )}

          <SectionHeader title="Movie picks" actionLabel="All movies" onAction={() => router.push('/movies')} />
          {movies.isLoading || !movies.data ? (
            <LoadingState label="Finding something good to watch…" />
          ) : (
            movies.data.items.slice(0, 2).map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                compact
                saved={savedMovieIds.has(movie.id)}
                saving={toggleMovie.isPending}
                onToggleSave={() =>
                  toggleMovie.mutate({ movie, saved: !savedMovieIds.has(movie.id) })
                }
              />
            ))
          )}

          <SectionHeader title="Hidden gems" actionLabel="Discover more" onAction={() => router.push('/discover')} />
          {discovery.isLoading || !discovery.data ? (
            <LoadingState label="Checking the web…" />
          ) : (
            discovery.data.items.slice(0, 1).map((item) => (
              <DiscoveryCard
                key={item.id}
                item={item}
                saved={savedDiscoveryIds.has(item.id)}
                saving={toggleDiscovery.isPending}
                onToggleSave={() =>
                  toggleDiscovery.mutate({ item, saved: !savedDiscoveryIds.has(item.id) })
                }
              />
            ))
          )}

          <View style={[styles.footer, { borderColor: theme.border }]}>
            <Text style={[styles.footerText, { color: theme.textMuted }]}>
              Your saved reads work offline. Add API keys in .env for live feeds.
            </Text>
          </View>
        </ScreenContent>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { borderRadius: radius.lg, padding: space.lg, marginBottom: space.lg },
  heroTitle: { color: '#fff', fontSize: 18, fontWeight: '800', marginTop: 8 },
  heroSubtitle: { color: '#fff', fontSize: 13, lineHeight: 19, marginTop: 4, opacity: 0.9 },
  heroPills: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 },
  heroPill: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.pill, marginRight: 6, marginBottom: 6 },
  actions: { flexDirection: 'row', gap: space.md, marginBottom: space.xl },
  action: {
    flex: 1,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: space.lg,
    alignItems: 'center',
    gap: 6,
  },
  actionLabel: { fontSize: 13, fontWeight: '700' },
  footer: { borderTopWidth: 1, paddingTop: space.lg, marginTop: space.lg },
  footerText: { fontSize: 12, lineHeight: 18, textAlign: 'center' },
});
