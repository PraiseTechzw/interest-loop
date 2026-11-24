import { useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { NewsCard } from '@/components/content-cards';
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
import { useInterests, useNews, useSavedArticles, useToggleSavedArticle } from '@/hooks/use-app-data';
import { space, useTheme } from '@/theme/tokens';
import { INTEREST_BY_ID, type InterestId } from '@/constants/interests';

export default function NewsScreen() {
  const theme = useTheme();
  const interests = useInterests();
  const news = useNews(interests.data ?? []);
  const saved = useSavedArticles();
  const toggleSave = useToggleSavedArticle();
  const [filter, setFilter] = useState<InterestId | 'all'>('all');
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);

  const selected = interests.data ?? [];
  const savedUrls = useMemo(
    () => new Set((saved.data ?? []).map((item) => item.url)),
    [saved.data],
  );

  const articles = useMemo(() => {
    const items = news.data?.items ?? [];
    return filter === 'all' ? items : items.filter((item) => item.interest === filter);
  }, [news.data, filter]);

  if (interests.isLoading) return <Screen><LoadingState label="Loading your interests…" /></Screen>;

  return (
    <Screen>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={news.isFetching}
            onRefresh={() => {
              news.refetch();
              saved.refetch();
            }}
          />
        }>
        <ScreenContent>
          <ScreenHeader title="Tech News" subtitle="Stories matched to what you follow." />

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

          {news.data?.notice && news.data.items.length > 0 ? (
            <NoticeBanner message={news.data.notice} />
          ) : null}

          {news.isLoading ? (
            <LoadingState label="Fetching the latest stories…" />
          ) : news.isError || news.data?.error ? (
            <ErrorState
              message={news.data?.error ?? 'Could not load news.'}
              onRetry={() => news.refetch()}
            />
          ) : articles.length === 0 ? (
            <EmptyState
              icon="newspaper-outline"
              title="No stories available"
              message={
                news.data?.notice ??
                'No live news is configured. Add an API key in .env to load stories.'
              }
            />
          ) : (
            articles.map((article) => (
              <NewsCard
                key={article.id}
                article={article}
                saved={savedUrls.has(article.url)}
                saving={pendingUrl === article.url}
                onToggleSave={() => {
                  setPendingUrl(article.url);
                  toggleSave.mutate(
                    { article, saved: !savedUrls.has(article.url) },
                    { onSettled: () => setPendingUrl(null) },
                  );
                }}
              />
            ))
          )}

          <Text style={[styles.footnote, { color: theme.textMuted }]}>
            Saved stories remain available offline.
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
