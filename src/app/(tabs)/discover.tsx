import { useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { DiscoveryCard } from '@/components/content-cards';
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
import { useDiscoveryFeed, useSavedDiscovery, useToggleSavedDiscovery } from '@/hooks/use-app-data';
import { space } from '@/theme/tokens';
import type { DiscoveryItem } from '@/types/models';

type SourceFilter = 'all' | DiscoveryItem['source'];

const FILTERS: { id: SourceFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'hacker-news', label: 'Hacker News' },
  { id: 'reddit', label: 'Reddit' },
  { id: 'curated', label: 'Curated' },
];

export default function DiscoverScreen() {
  const feed = useDiscoveryFeed();
  const saved = useSavedDiscovery();
  const toggleSave = useToggleSavedDiscovery();
  const [filter, setFilter] = useState<SourceFilter>('all');
  const [pendingId, setPendingId] = useState<string | null>(null);

  const savedIds = useMemo(
    () => new Set((saved.data ?? []).map((item) => item.id)),
    [saved.data],
  );

  const items = useMemo(() => {
    const all = feed.data?.items ?? [];
    return filter === 'all' ? all : all.filter((item) => item.source === filter);
  }, [feed.data, filter]);

  return (
    <Screen>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={feed.isFetching}
            onRefresh={() => {
              feed.refetch();
              saved.refetch();
            }}
          />
        }>
        <ScreenContent>
          <ScreenHeader
            title="Discover"
            subtitle="What others are missing — ranked by signal, not noise."
          />

          <View style={styles.filters}>
            {FILTERS.map((option) => (
              <Pill
                key={option.id}
                label={option.label}
                selected={filter === option.id}
                onPress={() => setFilter(option.id)}
              />
            ))}
          </View>

          {feed.data?.isDemo ? <DemoBanner message={feed.data.notice ?? ''} /> : null}

          {feed.isLoading ? (
            <LoadingState label="Scanning the web…" />
          ) : feed.isError ? (
            <ErrorState message="Could not load the discovery feed." onRetry={() => feed.refetch()} />
          ) : items.length === 0 ? (
            <EmptyState
              icon="compass-outline"
              title="Nothing in this source"
              message="Try another source to find something interesting."
            />
          ) : (
            items.map((item) => (
              <DiscoveryCard
                key={item.id}
                item={item}
                saved={savedIds.has(item.id)}
                saving={pendingId === item.id}
                onToggleSave={() => {
                  setPendingId(item.id);
                  toggleSave.mutate(
                    { item, saved: !savedIds.has(item.id) },
                    { onSettled: () => setPendingId(null) },
                  );
                }}
              />
            ))
          )}
        </ScreenContent>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  filters: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: space.md },
});
