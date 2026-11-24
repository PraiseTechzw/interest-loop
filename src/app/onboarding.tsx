import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Pill, Screen, ScreenContent, ScreenHeader } from '@/components/ui';
import { INTERESTS, type InterestId } from '@/constants/interests';
import { useSetInterest, useSetSetting, useInterests } from '@/hooks/use-app-data';
import { radius, space, useTheme } from '@/theme/tokens';

export default function OnboardingScreen() {
  const theme = useTheme();
  const interests = useInterests();
  const setInterest = useSetInterest();
  const setSetting = useSetSetting();
  const [selected, setSelected] = useState<InterestId[]>(interests.data ?? []);

  const canContinue = useMemo(() => selected.length >= 2, [selected.length]);

  function toggle(id: InterestId) {
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  function finish() {
    const original = new Set(interests.data ?? []);
    const next = new Set(selected);
    const operations = INTERESTS.filter(
      (interest) => original.has(interest.id) !== next.has(interest.id),
    ).map((interest) =>
      setInterest.mutateAsync({ tag: interest.id, selected: next.has(interest.id) }),
    );

    Promise.all([
      ...operations,
      setSetting.mutateAsync({ key: 'onboarded', value: '1' }),
      setSetting.mutateAsync({ key: 'profile_name', value: '' }),
    ]).then(() => router.replace('/'));
  }

  return (
    <Screen>
      <ScrollView>
        <ScreenContent>
          <View style={[styles.hero, { backgroundColor: theme.primary }]}>
            <Ionicons name="sparkles" size={28} color={theme.onPrimary} />
            <Text style={[styles.heroTitle, { color: theme.onPrimary }]}>Welcome to InterestLoop</Text>
            <Text style={[styles.heroText, { color: theme.onPrimary }]}>
              Pick at least two topics. We’ll use them to shape your news, movies, discovery feed and knowledge graph.
            </Text>
          </View>

          <ScreenHeader title="Choose your interests" subtitle="You can change these any time in Profile." />
          <View style={styles.chips}>
            {INTERESTS.map((interest) => (
              <Pill
                key={interest.id}
                label={interest.label}
                icon={interest.icon}
                color={interest.color}
                selected={selected.includes(interest.id)}
                onPress={() => toggle(interest.id)}
              />
            ))}
          </View>

          <Text style={[styles.count, { color: theme.textMuted }]}>
            {selected.length} selected · minimum 2
          </Text>

          <Pressable
            accessibilityRole="button"
            disabled={!canContinue || setInterest.isPending || setSetting.isPending}
            onPress={finish}
            style={[styles.button, { backgroundColor: theme.primary }, (!canContinue || setInterest.isPending || setSetting.isPending) && { opacity: 0.5 }]}>
            <Text style={{ color: theme.onPrimary, fontWeight: '700' }}>Start my loop</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={() => router.replace('/')} style={styles.skip}>
            <Text style={{ color: theme.textMuted }}>Skip for now</Text>
          </Pressable>
        </ScreenContent>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { borderRadius: radius.lg, padding: space.xl, marginBottom: space.xl },
  heroTitle: { color: '#fff', fontSize: 24, fontWeight: '800', marginTop: 12 },
  heroText: { color: '#fff', fontSize: 14, lineHeight: 20, marginTop: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap' },
  count: { fontSize: 12, marginTop: space.lg, textAlign: 'center' },
  button: { borderRadius: radius.md, paddingVertical: 14, alignItems: 'center', marginTop: space.lg },
  skip: { paddingVertical: 14, alignItems: 'center' },
});
