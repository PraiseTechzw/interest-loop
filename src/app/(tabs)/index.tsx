import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { DiscoveryCard, MovieCard, NewsCard } from '@/components/content-cards';
import {
  Card,
  DemoBanner,
  EmptyState,
  ErrorState,
  LoadingState,
  Screen,
  ScreenContent,
  ScreenHeader,
  SectionHeader,
} from '@/components/ui';
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
import type { DiscoveryItem, Movie, NewsArticle } from '@/types/models';

type NoticeProps = {
  interestPending: boolean;
  interestError: boolean;
  noInterests: boolean;
  pending: boolean;
  error: boolean;
  empty: boolean;
  retry: () => void;
  openProfile: () => void;
  loadingLabel: string;
  errorLabel: string;
  emptyTitle: string;
  emptyMessage: string;
};

/** Shared loading / error / empty handling for the dashboard's feed sections. */
function FeedNotice(props: NoticeProps) {
  if (props.interestPending || props.pending) {
    return <LoadingState label={props.loadingLabel} />;
  }
  if (props.interestError) {
    return <ErrorState message="Could not load your interests." onRetry={props.retry} />;
  }
  if (props.noInterests) {
    return (
      <EmptyState
        icon="sparkles-outline"
        title="Choose your interests"
        message="Pick a few topics in your profile to fill this section."
        actionLabel="Open profile"
        onAction={props.openProfile}
      />
    );
  }
  if (props.error) {
    return <ErrorState message={props.errorLabel} onRetry={props.retry} />;
  }
  if (props.empty) {
    return <EmptyState title={props.emptyTitle} message={props.emptyMessage} />;
  }
  return null;
}

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

  const [pendingArticle, setPendingArticle] = useState<string | null>(null);
  const [pendingMovie, setPendingMovie] = useState<number | null>(null);
  const [pendingDiscovery, setPendingDiscovery] = useState<string | null>(null);

  const selected = interests.data ?? [];
  const noInterests = !interests.isLoading && selected.length === 0;
  const openProfile = () => router.push('/profile');

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

  function onToggleArticle(article: NewsArticle) {
    setPendingArticle(article.url);
    toggleArticle.mutate(
      { article, saved: !savedArticleUrls.has(article.url) },
      { onSettled: () => setPendingArticle(null) },
    );
  }

  function onToggleMovie(movie: Movie) {
    setPendingMovie(movie.id);
    toggleMovie.mutate(
      { movie, saved: !savedMovieIds.has(movie.id) },
      { onSettled: () => setPendingMovie(null) },
    );
  }

  function onToggleDiscovery(item: DiscoveryItem) {
    setPendingDiscovery(item.id);
    toggleDiscovery.mutate(
      { item, saved: !savedDiscoveryIds.has(item.id) },
      { onSettled: () => setPendingDiscovery(null) },
    );
  }

  const feedNotice = {
    interestPending: interests.isLoading,
    interestError: interests.isError,
    noInterests,
    retry: refresh,
    openProfile,
  };

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
            <Pressable
              onPress={() => router.push('/learning')}
              accessibilityRole="button"
              style={[styles.action, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Ionicons name="library-outline" size={22} color={theme.primary} />
              <Text style={[styles.actionLabel, { color: theme.text }]}>Paths</Text>
            </Pressable>
          </View>

          {news.data?.isDemo ? <DemoBanner message={news.data.notice ?? ''} /> : null}

          <SectionHeader title="Top stories" actionLabel="All news" onAction={() => router.push('/news')} />
          <FeedNotice
            {...feedNotice}
            pending={news.isLoading}
            error={news.isError}
            empty={(news.data?.items.length ?? 0) === 0}
            retry={() => news.refetch()}
            loadingLabel="Gathering your stories…"
            errorLabel="Could not load stories."
            emptyTitle="Nothing here yet"
            emptyMessage="Try adding more interests in your profile."
          />
          {news.data?.items.slice(0, 2).map((article) => (
            <NewsCard
              key={article.id}
              article={article}
              compact
              saved={savedArticleUrls.has(article.url)}
              saving={pendingArticle === article.url}
              onToggleSave={() => onToggleArticle(article)}
            />
          ))}

          <SectionHeader title="Movie picks" actionLabel="All movies" onAction={() => router.push('/movies')} />
          <FeedNotice
            {...feedNotice}
            pending={movies.isLoading}
            error={movies.isError}
            empty={(movies.data?.items.length ?? 0) === 0}
            retry={() => movies.refetch()}
            loadingLabel="Finding something good to watch…"
            errorLabel="Could not load movies."
            emptyTitle="No picks yet"
            emptyMessage="Try a different set of interests in your profile."
          />
          {movies.data?.items.slice(0, 2).map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              compact
              saved={savedMovieIds.has(movie.id)}
              saving={pendingMovie === movie.id}
              onToggleSave={() => onToggleMovie(movie)}
            />
          ))}

          <SectionHeader title="Hidden gems" actionLabel="Discover more" onAction={() => router.push('/discover')} />
          <FeedNotice
            interestPending={false}
            interestError={false}
            noInterests={false}
            pending={discovery.isLoading}
            error={discovery.isError}
            empty={(discovery.data?.items.length ?? 0) === 0}
            retry={() => discovery.refetch()}
            openProfile={openProfile}
            loadingLabel="Checking the web…"
            errorLabel="Could not load discoveries."
            emptyTitle="No finds right now"
            emptyMessage="Pull to refresh to try again."
          />
          {discovery.data?.items.slice(0, 1).map((item) => (
            <DiscoveryCard
              key={item.id}
              item={item}
              saved={savedDiscoveryIds.has(item.id)}
              saving={pendingDiscovery === item.id}
              onToggleSave={() => onToggleDiscovery(item)}
            />
          ))}

          <SectionHeader title="Remember this moment" />
          <Card
            onPress={() => router.push('/capsule')}
            accessibilityLabel="Create a time capsule">
            <View style={styles.row}>
              <View style={[styles.capsuleIcon, { backgroundColor: theme.primarySoft }]}>
                <Ionicons name="hourglass-outline" size={20} color={theme.primary} />
              </View>
              <View style={styles.flex}>
                <Text style={[styles.capsuleTitle, { color: theme.text }]}>Create a time capsule</Text>
                <Text style={[styles.capsuleSubtitle, { color: theme.textMuted }]}>
                  Save a dated snapshot of your interests and progress.
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
            </View>
          </Card>

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
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  flex: { flex: 1 },
  capsuleIcon: { width: 40, height: 40, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  capsuleTitle: { fontSize: 15, fontWeight: '700' },
  capsuleSubtitle: { fontSize: 12, lineHeight: 17, marginTop: 3 },
  footer: { borderTopWidth: 1, paddingTop: space.lg, marginTop: space.lg },
  footerText: { fontSize: 12, lineHeight: 18, textAlign: 'center' },
});
