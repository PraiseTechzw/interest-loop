import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Card, Pill, Screen, ScreenContent, ScreenHeader, SectionHeader } from '@/components/ui';
import { INTERESTS } from '@/constants/interests';
import {
  useCoachResponses,
  useInterests,
  useProfile,
  useSavedArticles,
  useSavedDiscovery,
  useSavedMovies,
  useSetInterest,
} from '@/hooks/use-app-data';
import { initials } from '@/lib/format';
import { getDataSources, sourceStatusLabel } from '@/lib/sources';
import { radius, space, useTheme } from '@/theme/tokens';

export default function ProfileScreen() {
  const theme = useTheme();
  const interests = useInterests();
  const profile = useProfile();
  const setInterest = useSetInterest();
  const articles = useSavedArticles();
  const movies = useSavedMovies();
  const discovery = useSavedDiscovery();
  const responses = useCoachResponses();

  const selected = new Set(interests.data ?? []);
  const sources = getDataSources();
  const displayName = profile.data?.name?.trim();
  const bio = profile.data?.bio?.trim();

  const stats = [
    { label: 'Articles', value: articles.data?.length ?? 0, icon: 'newspaper-outline' as const },
    { label: 'Movies', value: movies.data?.length ?? 0, icon: 'film-outline' as const },
    { label: 'Finds', value: discovery.data?.length ?? 0, icon: 'compass-outline' as const },
    { label: 'Insights', value: responses.data?.length ?? 0, icon: 'bulb-outline' as const },
  ];

  return (
    <Screen>
      <ScrollView>
        <ScreenContent>
          <ScreenHeader title="Profile" subtitle="Make the loop yours." />

          <Card style={styles.identityCard}>
            <View style={styles.identityRow}>
              <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
                <Text style={[styles.avatarText, { color: theme.onPrimary }]}>
                  {initials(displayName || 'You') || 'Y'}
                </Text>
              </View>
              <View style={styles.identityText}>
                <Text style={[styles.displayName, { color: theme.text }]}>
                  {displayName || 'Your profile'}
                </Text>
                <Text style={[styles.bio, { color: theme.textMuted }]} numberOfLines={3}>
                  {bio || 'Curious by default. Shape your loop with the topics you love.'}
                </Text>
              </View>
            </View>
            <Pressable
              onPress={() => router.push('/profile-edit')}
              accessibilityRole="button"
              accessibilityLabel="Edit profile"
              style={({ pressed }) => [
                styles.editButton,
                { borderColor: theme.border, backgroundColor: theme.surfaceAlt },
                pressed && { opacity: 0.7 },
              ]}>
              <Ionicons name="create-outline" size={15} color={theme.primary} />
              <Text style={[styles.editLabel, { color: theme.primary }]}>Edit profile</Text>
            </Pressable>
          </Card>

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
            <Pressable onPress={() => router.push('/search')} accessibilityRole="button" style={[styles.tool, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Ionicons name="search-outline" size={20} color={theme.primary} />
              <Text style={[styles.toolText, { color: theme.text }]}>Search</Text>
            </Pressable>
            <Pressable onPress={() => router.push('/feedback')} accessibilityRole="button" style={[styles.tool, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Ionicons name="chatbox-outline" size={20} color={theme.accent} />
              <Text style={[styles.toolText, { color: theme.text }]}>Feedback</Text>
            </Pressable>
            <Pressable onPress={() => router.push('/community')} accessibilityRole="button" style={[styles.tool, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Ionicons name="people-outline" size={20} color={theme.success} />
              <Text style={[styles.toolText, { color: theme.text }]}>Community</Text>
            </Pressable>
            <Pressable onPress={() => router.push('/diagnostics')} accessibilityRole="button" style={[styles.tool, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Ionicons name="pulse-outline" size={20} color={theme.primary} />
              <Text style={[styles.toolText, { color: theme.text }]}>Diagnostics</Text>
            </Pressable>
            <Pressable onPress={() => router.push('/export')} accessibilityRole="button" style={[styles.tool, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Ionicons name="download-outline" size={20} color={theme.primary} />
              <Text style={[styles.toolText, { color: theme.text }]}>Export data</Text>
            </Pressable>
            <Pressable onPress={() => router.push('/accessibility')} accessibilityRole="button" style={[styles.tool, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Ionicons name="accessibility-outline" size={20} color={theme.success} />
              <Text style={[styles.toolText, { color: theme.text }]}>Accessibility</Text>
            </Pressable>
            <Pressable onPress={() => router.push('/terms')} accessibilityRole="button" style={[styles.tool, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Ionicons name="document-text-outline" size={20} color={theme.textMuted} />
              <Text style={[styles.toolText, { color: theme.text }]}>Terms</Text>
            </Pressable>
          </View>

          <SectionHeader title="Data sources" />
          <Card>
            {sources.map((source) => (
              <View key={source.key} style={styles.sourceRow}>
                <Text style={[styles.rowTitle, { color: theme.text }]}>{source.label}</Text>
                <Text
                  style={{
                    color: source.connected ? theme.success : theme.textMuted,
                    fontWeight: '700',
                  }}>
                  {sourceStatusLabel(source.connected)}
                </Text>
              </View>
            ))}
            <Text style={[styles.helper, { color: theme.textMuted }]}>
              Keys are read from .env at build time. Add them there (or in EAS for installed builds)
              and restart the app to go live.
            </Text>
          </Card>
        </ScreenContent>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  identityCard: { marginBottom: space.lg },
  identityRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 20, fontWeight: '800' },
  identityText: { flex: 1 },
  displayName: { fontSize: 18, fontWeight: '800' },
  bio: { fontSize: 12, lineHeight: 17, marginTop: 3 },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: 9,
    marginTop: space.md,
  },
  editLabel: { fontSize: 13, fontWeight: '700' },
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
  linkIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: { fontSize: 15, fontWeight: '700' },
  rowSubtitle: { fontSize: 12, marginTop: 3 },
  tools: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md, marginBottom: space.xl },
  tool: {
    width: '48%',
    borderWidth: 1,
    borderRadius: radius.md,
    padding: space.md,
    alignItems: 'center',
    gap: 6,
  },
  toolText: { fontSize: 12, fontWeight: '700', textAlign: 'center' },
  sourceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
});
