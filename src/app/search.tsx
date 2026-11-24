import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Card, EmptyState, Screen, ScreenContent, ScreenHeader, SectionHeader } from '@/components/ui';
import { useSavedArticles, useSavedDiscovery, useSavedMovies } from '@/hooks/use-app-data';
import { truncate } from '@/lib/format';
import { useTheme } from '@/theme/tokens';

type Result = { key: string; title: string; subtitle: string; kind: string; href: string };

export default function SearchScreen() {
  const theme = useTheme();
  const [query, setQuery] = useState('');
  const articles = useSavedArticles();
  const movies = useSavedMovies();
  const finds = useSavedDiscovery();

  const results = useMemo<Result[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const all: Result[] = [
      ...(articles.data ?? []).map((item) => ({
        key: `article-${item.id}`,
        title: item.title,
        subtitle: `${item.source} · article`,
        kind: 'article',
        href: `/article/${encodeURIComponent(item.url)}`,
      })),
      ...(movies.data ?? []).map((item) => ({
        key: `movie-${item.id}`,
        title: item.title,
        subtitle: `Movie · ${item.vote_average.toFixed(1)}`,
        kind: 'movie',
        href: `/movie/${item.tmdb_id}`,
      })),
      ...(finds.data ?? []).map((item) => ({
        key: `find-${item.id}`,
        title: item.title,
        subtitle: `${item.source} · discovery`,
        kind: 'find',
        href: '',
      })),
    ];
    return all.filter((item) => `${item.title} ${item.subtitle}`.toLowerCase().includes(q));
  }, [query, articles.data, movies.data, finds.data]);

  return (
    <Screen>
      <Stack.Screen options={{ title: 'Search' }} />
      <ScrollView>
        <ScreenContent>
          <ScreenHeader title="Search" subtitle="Find something you saved on this device." />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search articles, movies, finds…"
            placeholderTextColor={theme.textMuted}
            accessibilityLabel="Search saved items"
            style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
          />

          {query.trim().length === 0 ? (
            <EmptyState icon="search-outline" title="Search your library" message="Type a title or source to find saved content." />
          ) : (
            <>
              <SectionHeader title={`${results.length} result(s)`} />
              {results.length === 0 ? (
                <EmptyState title="No matches" message="Try a different word or save more items." />
              ) : (
                results.map((result) => (
                  <Card key={result.key} onPress={result.href ? () => router.push(result.href as never) : undefined}>
                    <View style={styles.row}>
                      <Ionicons
                        name={result.kind === 'movie' ? 'film-outline' : result.kind === 'find' ? 'compass-outline' : 'newspaper-outline'}
                        size={20}
                        color={theme.primary}
                      />
                      <View style={styles.flex}>
                        <Text style={{ color: theme.text, fontWeight: '700' }}>{truncate(result.title, 80)}</Text>
                        <Text style={{ color: theme.textMuted, fontSize: 12, marginTop: 3 }}>{result.subtitle}</Text>
                      </View>
                    </View>
                  </Card>
                ))
              )}
            </>
          )}
        </ScreenContent>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: { borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 14 },
  row: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  flex: { flex: 1 },
});
