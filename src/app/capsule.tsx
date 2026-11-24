import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import * as Clipboard from 'expo-clipboard';
import { useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { Card, NoticeBanner, LoadingState, Screen, ScreenContent, ScreenHeader, SectionHeader } from '@/components/ui';
import { INTEREST_BY_ID } from '@/constants/interests';
import {
  useCoachResponses,
  useInterestActivity,
  useInterests,
  useSavedArticles,
  useSavedDiscovery,
  useSavedMovies,
} from '@/hooks/use-app-data';
import { buildCapsuleText } from '@/lib/capsule';
import { radius, space, useTheme } from '@/theme/tokens';

export default function CapsuleScreen() {
  const theme = useTheme();
  const interests = useInterests();
  const articles = useSavedArticles();
  const movies = useSavedMovies();
  const finds = useSavedDiscovery();
  const responses = useCoachResponses();
  const activity = useInterestActivity();
  const [includeReflections, setIncludeReflections] = useState(false);

  const today = useQuery({
    queryKey: ['today-label'],
    queryFn: () =>
      new Date().toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    staleTime: 60 * 60 * 1000,
  });

  if (
    interests.isLoading ||
    articles.isLoading ||
    movies.isLoading ||
    finds.isLoading ||
    responses.isLoading ||
    activity.isLoading
  ) {
    return <Screen><LoadingState label="Assembling your capsule…" /></Screen>;
  }

  const selected = interests.data ?? [];
  const interestLabels = selected.map((id) => INTEREST_BY_ID[id].label);
  const topTopics = Object.entries(activity.data ?? {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([id]) => INTEREST_BY_ID[id as keyof typeof INTEREST_BY_ID]?.label ?? id);

  const summary = buildCapsuleText({
    date: today.data ?? 'today',
    interestLabels,
    articleCount: articles.data?.length ?? 0,
    movieCount: movies.data?.length ?? 0,
    findCount: finds.data?.length ?? 0,
    reflectionCount: responses.data?.length ?? 0,
    topTopics,
    reflections: includeReflections
      ? (responses.data ?? []).map((entry) => entry.response)
      : undefined,
  });

  async function share() {
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await navigator.share({ title: 'My InterestLoop capsule', text: summary });
        return;
      } catch {
        // User cancelled the native share sheet — fall through to clipboard.
      }
    }

    await Clipboard.setStringAsync(summary);
    Alert.alert('Capsule copied', 'Paste it anywhere to share your snapshot.');
  }

  const stats = [
    { label: 'Articles', value: articles.data?.length ?? 0 },
    { label: 'Movies', value: movies.data?.length ?? 0 },
    { label: 'Finds', value: finds.data?.length ?? 0 },
    { label: 'Reflections', value: responses.data?.length ?? 0 },
  ];

  return (
    <Screen>
      <ScrollView>
        <ScreenContent>
          <ScreenHeader
            title="Time Capsule"
            subtitle="A dated snapshot of what you care about right now."
          />

          <NoticeBanner message="Privacy first: reflection text is never included unless you switch it on below." />

          <Card>
            <View style={styles.badge}>
              <Ionicons name="hourglass-outline" size={16} color={theme.primary} />
              <Text style={[styles.badgeText, { color: theme.primary }]}>{today.data ?? 'Today'}</Text>
            </View>
            <Text style={[styles.capsuleTitle, { color: theme.text }]}>My InterestLoop capsule</Text>

            <SectionHeader title="Interests in this capsule" />
            <View style={styles.chips}>
              {interestLabels.map((label) => (
                <View key={label} style={[styles.chip, { backgroundColor: theme.primarySoft }]}>
                  <Text style={{ color: theme.primary, fontSize: 12, fontWeight: '700' }}>{label}</Text>
                </View>
              ))}
            </View>

            <SectionHeader title="Snapshot" />
            <View style={styles.stats}>
              {stats.map((stat) => (
                <View key={stat.label} style={[styles.stat, { backgroundColor: theme.surfaceAlt }]}>
                  <Text style={[styles.statValue, { color: theme.text }]}>{stat.value}</Text>
                  <Text style={[styles.statLabel, { color: theme.textMuted }]}>{stat.label}</Text>
                </View>
              ))}
            </View>

            <Text style={[styles.sectionLabel, { color: theme.text }]}>Top topics</Text>
            <Text style={[styles.body, { color: theme.textMuted }]}>
              {topTopics.length > 0 ? topTopics.join(' · ') : 'Save a few items to reveal your top topics.'}
            </Text>
          </Card>

          <Card>
            <View style={styles.privacyRow}>
              <View style={styles.flex}>
                <Text style={[styles.sectionLabel, { color: theme.text }]}>Include reflection text</Text>
                <Text style={[styles.body, { color: theme.textMuted }]}>
                  Off by default. Only the first three reflections are included when enabled.
                </Text>
              </View>
              <Switch
                value={includeReflections}
                onValueChange={setIncludeReflections}
                accessibilityLabel="Include reflection text in capsule"
                trackColor={{ false: theme.border, true: theme.primary }}
              />
            </View>
          </Card>

          <Pressable
            accessibilityRole="button"
            onPress={share}
            style={({ pressed }) => [
              styles.shareButton,
              { backgroundColor: theme.primary },
              pressed && { opacity: 0.8 },
            ]}>
            <Ionicons name="share-outline" size={18} color={theme.onPrimary} />
            <Text style={[styles.shareLabel, { color: theme.onPrimary }]}>Copy / share capsule</Text>
          </Pressable>

          <Card>
            <Text style={[styles.sectionLabel, { color: theme.text }]}>Preview</Text>
            <Text style={[styles.preview, { color: theme.textMuted }]}>{summary}</Text>
          </Card>
        </ScreenContent>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  capsuleTitle: { fontSize: 20, fontWeight: '800', marginTop: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 6 },
  stats: { flexDirection: 'row', gap: space.sm },
  stat: { flex: 1, borderRadius: radius.sm, paddingVertical: space.md, alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: '800' },
  statLabel: { fontSize: 10, fontWeight: '600' },
  sectionLabel: { fontSize: 13, fontWeight: '700', marginBottom: 8 },
  body: { fontSize: 12, lineHeight: 18 },
  privacyRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  flex: { flex: 1 },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: radius.md,
    paddingVertical: 14,
    marginBottom: space.md,
  },
  shareLabel: { fontSize: 15, fontWeight: '700' },
  preview: { fontSize: 12, lineHeight: 19, fontFamily: 'monospace' },
});
