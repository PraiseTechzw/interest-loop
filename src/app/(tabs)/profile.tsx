import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Card, Pill, Screen, ScreenContent, ScreenHeader, SectionHeader } from '@/components/ui';
import { INTERESTS } from '@/constants/interests';
import {
  useCoachResponses,
  useInterestCatalogue,
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
  const catalogue = useInterestCatalogue();
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
    { label: 'Articles', value: articles.data?.length ?? 0 },
    { label: 'Movies', value: movies.data?.length ?? 0 },
    { label: 'Finds', value: discovery.data?.length ?? 0 },
    { label: 'Insights', value: responses.data?.length ?? 0 },
  ];

  const tools = [
    { label: 'Capture a thought', href: '/capture', icon: 'create-outline' as const },
    { label: 'My topics', href: '/interests', icon: 'sparkles-outline' as const },
    { label: 'Mindset Coach', href: '/coach', icon: 'bulb-outline' as const },
    { label: 'Knowledge Graph', href: '/graph', icon: 'git-network-outline' as const },
    { label: 'Learning Paths', href: '/learning', icon: 'library-outline' as const },
    { label: 'Time Capsule', href: '/capsule', icon: 'hourglass-outline' as const },
    { label: 'Settings', href: '/settings', icon: 'settings-outline' as const },
    { label: 'Privacy', href: '/privacy', icon: 'lock-closed-outline' as const },
    { label: 'Search', href: '/search', icon: 'search-outline' as const },
    { label: 'Feedback', href: '/feedback', icon: 'chatbox-outline' as const },
    { label: 'Diagnostics', href: '/diagnostics', icon: 'pulse-outline' as const },
    { label: 'Backup & restore', href: '/export', icon: 'download-outline' as const },
    { label: 'Accessibility', href: '/accessibility', icon: 'accessibility-outline' as const },
    { label: 'Terms', href: '/terms', icon: 'document-text-outline' as const },
  ];

  return (
    <Screen edges={['top']}>
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

          <Card style={styles.statsCard}>
            <View style={styles.stats}>
              {stats.map((stat) => (
                <View key={stat.label} style={styles.stat}>
                  <Text style={[styles.statValue, { color: theme.text }]}>{stat.value}</Text>
                  <Text style={[styles.statLabel, { color: theme.textMuted }]}>{stat.label}</Text>
                </View>
              ))}
            </View>
          </Card>

          <SectionHeader title="Your interests" />
          <Text style={[styles.helper, { color: theme.textMuted }]}>
            News, movies and your knowledge graph update as you change these.
          </Text>
          <View style={styles.chips}>
            {(catalogue.data ?? INTERESTS).map((interest) => (
              <Pill
                key={interest.id}
                label={interest.label}
                icon={interest.icon}
                color={interest.color}
                selected={selected.has(interest.id)}
                role="checkbox"
                busy={setInterest.isPending}
                onPress={() =>
                  setInterest.mutate({ tag: interest.id, selected: !selected.has(interest.id) })
                }
              />
            ))}
          </View>
          <Pressable
            onPress={() => router.push('/interests')}
            accessibilityRole="button"
            style={styles.manageTopics}>
            <Ionicons name="add-circle-outline" size={16} color={theme.primary} />
            <Text style={{ color: theme.primary, fontWeight: '700', fontSize: 13 }}>
              Add or manage your own topics
            </Text>
          </Pressable>

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
          <Card style={styles.toolsCard}>
            {tools.map((tool, index) => (
              <Pressable
                key={tool.label}
                onPress={() => router.push(tool.href)}
                accessibilityRole="button"
                style={[styles.toolRow, index > 0 && { borderTopWidth: 1, borderColor: theme.border }]}>
                <Ionicons name={tool.icon} size={18} color={theme.textMuted} />
                <Text style={[styles.toolLabel, { color: theme.text }]}>{tool.label}</Text>
                <Ionicons name="chevron-forward" size={16} color={theme.textMuted} />
              </Pressable>
            ))}
          </Card>

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
  statsCard: { paddingVertical: space.md },
  stats: { flexDirection: 'row' },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statValue: { fontSize: 24, fontWeight: '500' },
  statLabel: { fontSize: 12, fontWeight: '400' },
  helper: { fontSize: 12, lineHeight: 17, marginBottom: space.md },
  chips: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: space.sm },
  manageTopics: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6, marginBottom: space.xl },
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
  toolsCard: { paddingVertical: 0, paddingHorizontal: space.md },
  toolRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: 12 },
  toolLabel: { flex: 1, fontSize: 14, fontWeight: '500' },
  sourceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
});
