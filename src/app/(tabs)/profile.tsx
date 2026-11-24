import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card, Pill, Screen, ScreenContent, ScreenHeader, SectionHeader } from '@/components/ui';
import { INTERESTS } from '@/constants/interests';
import {
  useCoachResponses,
  useInterests,
  useSavedArticles,
  useSavedDiscovery,
  useSavedMovies,
  useSetInterest,
} from '@/hooks/use-app-data';
import { radius, space, useTheme } from '@/theme/tokens';

export default function ProfileScreen() {
  const theme = useTheme();
  const interests = useInterests();
  const setInterest = useSetInterest();
  const articles = useSavedArticles();
  const movies = useSavedMovies();
  const discovery = useSavedDiscovery();
  const responses = useCoachResponses();

  const selected = new Set(interests.data ?? []);
  const newsKey = Boolean(process.env.EXPO_PUBLIC_NEWSAPI_KEY?.trim());
  const freeNewsKey = Boolean(process.env.EXPO_PUBLIC_FREENEWS_KEY?.trim());
  const tmdbKey = Boolean(process.env.EXPO_PUBLIC_TMDB_KEY?.trim());

  const stats = [
    { label: 'Articles', value: articles.data?.length ?? 0, icon: 'newspaper-outline' as const },
    { label: 'Movies', value: movies.data?.length ?? 0, icon: 'film-outline' as const },
    { label: 'Finds', value: discovery.data?.length ?? 0, icon: 'compass-outline' as const },
    { label: 'Insights', value: responses.data?.length ?? 0, icon: 'bulb-outline' as const },
  ];

  return (
    <Screen>
      <ScreenContent>
        <ScreenHeader title="Profile" subtitle="Make the loop yours." />

        <View style={styles.stats}>
          {stats.map((stat) => (
            <View
              key={stat.label}
              style={[styles.stat, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Ionicons name={stat.icon} size={19} color={theme.primary} />
              <Text style={[styles.statValue, { color: theme.text }]}>{stat.value}</Text>
              <Text style={[styles.statLabel, { color: theme.textMuted }]}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <SectionHeader title="Your interests" />
        <Text style={[styles.helper, { color: theme.textMuted }]}>
          News, movies and your knowledge graph update as you change these.
        </Text>
        <View style={styles.chips}>
          {INTERESTS.map((interest) => (
            <Pill
              key={interest.id}
              label={interest.label}
              icon={interest.icon}
              color={interest.color}
              selected={selected.has(interest.id)}
              onPress={() =>
                setInterest.mutate({ tag: interest.id, selected: !selected.has(interest.id) })
              }
            />
          ))}
        </View>

        <SectionHeader title="Your library" />
        <Pressable
          onPress={() => router.push('/saved')}
          accessibilityRole="button"
          accessibilityLabel="Open saved items"
          style={({ pressed }) => [
            styles.linkCard,
            { backgroundColor: theme.surface, borderColor: theme.border },
            pressed && { opacity: 0.75 },
          ]}>
          <View style={styles.row}>
            <View style={[styles.linkIcon, { backgroundColor: theme.primarySoft }]}>
              <Ionicons name="bookmark-outline" size={20} color={theme.primary} />
            </View>
            <View style={styles.flex}>
              <Text style={[styles.rowTitle, { color: theme.text }]}>Saved for later</Text>
              <Text style={[styles.rowSubtitle, { color: theme.textMuted }]}>
                {(articles.data?.length ?? 0) +
                  (movies.data?.length ?? 0) +
                  (discovery.data?.length ?? 0)}{' '}
                items available offline
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
          </View>
        </Pressable>

        <SectionHeader title="Tools" />
        <View style={styles.tools}>
          <Pressable
            onPress={() => router.push('/coach')}
            accessibilityRole="button"
            style={[styles.tool, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Ionicons name="bulb-outline" size={20} color={theme.accent} />
            <Text style={[styles.toolText, { color: theme.text }]}>Mindset Coach</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push('/graph')}
            accessibilityRole="button"
            style={[styles.tool, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Ionicons name="git-network-outline" size={20} color={theme.primary} />
            <Text style={[styles.toolText, { color: theme.text }]}>Knowledge Graph</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push('/learning')}
            accessibilityRole="button"
            style={[styles.tool, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Ionicons name="library-outline" size={20} color={theme.success} />
            <Text style={[styles.toolText, { color: theme.text }]}>Learning Paths</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push('/capsule')}
            accessibilityRole="button"
            style={[styles.tool, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Ionicons name="hourglass-outline" size={20} color={theme.accent} />
            <Text style={[styles.toolText, { color: theme.text }]}>Time Capsule</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push('/settings')}
            accessibilityRole="button"
            style={[styles.tool, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Ionicons name="settings-outline" size={20} color={theme.textMuted} />
            <Text style={[styles.toolText, { color: theme.text }]}>Settings</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push('/privacy')}
            accessibilityRole="button"
            style={[styles.tool, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Ionicons name="lock-closed-outline" size={20} color={theme.success} />
            <Text style={[styles.toolText, { color: theme.text }]}>Privacy</Text>
          </Pressable>
        </View>

        <SectionHeader title="Data sources" />
        <Card>
          <View style={styles.sourceRow}>
            <Text style={[styles.rowTitle, { color: theme.text }]}>NewsAPI</Text>
            <Text style={{ color: newsKey ? theme.success : theme.textMuted, fontWeight: '700' }}>
              {newsKey ? 'Live' : 'Not connected'}
            </Text>
          </View>
          <View style={styles.sourceRow}>
            <Text style={[styles.rowTitle, { color: theme.text }]}>FreeNewsApi</Text>
            <Text style={{ color: freeNewsKey ? theme.success : theme.textMuted, fontWeight: '700' }}>
              {freeNewsKey ? 'Live' : 'Not connected'}
            </Text>
          </View>
          <View style={styles.sourceRow}>
            <Text style={[styles.rowTitle, { color: theme.text }]}>TMDB</Text>
            <Text style={{ color: tmdbKey ? theme.success : theme.textMuted, fontWeight: '700' }}>
              {tmdbKey ? 'Live' : 'Sample data'}
            </Text>
          </View>
          <Text style={[styles.helper, { color: theme.textMuted }]}>
            Add keys to a .env file and restart the app to switch to live data.
          </Text>
        </Card>
      </ScreenContent>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stats: { flexDirection: 'row', gap: space.sm, marginBottom: space.xl },
  stat: {
    flex: 1,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: space.md,
    alignItems: 'center',
    gap: 4,
  },
  statValue: { fontSize: 18, fontWeight: '800' },
  statLabel: { fontSize: 10, fontWeight: '600' },
  helper: { fontSize: 12, lineHeight: 17, marginBottom: space.md },
  chips: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: space.xl },
  linkCard: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: space.lg,
    marginBottom: space.md,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  flex: { flex: 1 },
  linkIcon: { width: 38, height: 38, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  rowTitle: { fontSize: 15, fontWeight: '700' },
  rowSubtitle: { fontSize: 12, marginTop: 3 },
  tools: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md, marginBottom: space.xl },
  tool: { flex: 1, borderWidth: 1, borderRadius: radius.md, padding: space.md, alignItems: 'center', gap: 6 },
  toolText: { fontSize: 12, fontWeight: '700', textAlign: 'center' },
  sourceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
});
