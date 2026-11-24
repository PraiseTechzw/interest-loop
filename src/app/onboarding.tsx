import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  LoadingState,
  Pill,
  Screen,
  ScreenContent,
  ScreenHeader,
} from '@/components/ui';
import { INTERESTS, type InterestId } from '@/constants/interests';
import { useInterests, useSetInterest, useSetSetting } from '@/hooks/use-app-data';
import { radius, space, useTheme } from '@/theme/tokens';

export default function OnboardingScreen() {
  const theme = useTheme();
  const interests = useInterests();
  const setInterest = useSetInterest();
  const setSetting = useSetSetting();
  const [chosen, setChosen] = useState<InterestId[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  // Fall back to the stored interests until the user makes a choice, so a
  // slow database read never shows "0 selected" for an existing selection.
  const selected = chosen ?? interests.data ?? [];
  const canContinue = selected.length >= 2;
  const working = busy || setInterest.isPending || setSetting.isPending;

  function toggle(id: InterestId) {
    setChosen((current) => {
      const base = current ?? interests.data ?? [];
      return base.includes(id) ? base.filter((item) => item !== id) : [...base, id];
    });
    setFailed(false);
  }


  async function finish() {
    setBusy(true);
    setFailed(false);
    const original = new Set(interests.data ?? []);
    const next = new Set(selected);
    const operations = INTERESTS.filter(
      (interest) => original.has(interest.id) !== next.has(interest.id),
    ).map((interest) =>
      setInterest.mutateAsync({ tag: interest.id, selected: next.has(interest.id) }),
    );

    try {
      await Promise.all([
        ...operations,
        setSetting.mutateAsync({ key: 'onboarded', value: '1' }),
      ]);
      router.replace('/');
    } catch {
      setFailed(true);
      setBusy(false);
    }
  }

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={styles.flex}>
        <ScrollView contentInsetAdjustmentBehavior="automatic">
          <ScreenContent>
            <View style={[styles.hero, { backgroundColor: theme.primary }]}>
              <Ionicons name="sparkles" size={28} color={theme.onPrimary} />
              <Text style={[styles.heroTitle, { color: theme.onPrimary }]}>
                Welcome to InterestLoop
              </Text>
              <Text style={[styles.heroText, { color: theme.onPrimary }]}>
                Pick at least two topics. We’ll use them to shape your news, movies, discovery feed
                and knowledge graph.
              </Text>
            </View>

            {interests.isLoading ? (
              <LoadingState label="Loading your interests…" />
            ) : (
              <>
                <ScreenHeader
                  title="Choose your interests"
                  subtitle="You can change these any time in Profile."
                />
                <View style={styles.chips}>
                  {INTERESTS.map((interest) => (
                    <Pill
                      key={interest.id}
                      label={interest.label}
                      icon={interest.icon}
                      color={interest.color}
                      selected={selected.includes(interest.id)}
                      role="checkbox"
                      busy={working}
                      onPress={() => toggle(interest.id)}
                    />
                  ))}
                </View>

                <Text style={[styles.count, { color: theme.textMuted }]}>
                  {selected.length} selected · minimum 2
                </Text>

                {failed ? (
                  <Text style={[styles.error, { color: theme.danger }]}>
                    Could not save your choices. Please try again.
                  </Text>
                ) : null}
              </>
            )}
          </ScreenContent>
        </ScrollView>

        <View style={[styles.footer, { backgroundColor: theme.background, borderColor: theme.border }]}>
          <Pressable
            accessibilityRole="button"
            disabled={!canContinue || working || interests.isLoading}
            onPress={finish}
            style={[
              styles.button,
              { backgroundColor: theme.primary },
              (!canContinue || working || interests.isLoading) && { opacity: 0.5 },
            ]}>
            <Text style={[styles.buttonLabel, { color: theme.onPrimary }]}>
              {working ? 'Saving…' : 'Start my loop'}
            </Text>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { borderRadius: radius.lg, padding: space.xl, marginBottom: space.xl },
  heroTitle: { fontSize: 24, fontWeight: '800', marginTop: 12 },
  heroText: { fontSize: 14, lineHeight: 20, marginTop: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap' },
  count: { fontSize: 12, marginTop: space.lg, textAlign: 'center' },
  error: { fontSize: 12, textAlign: 'center', marginTop: space.md },
  flex: { flex: 1 },
  footer: { borderTopWidth: 1, paddingHorizontal: space.lg, paddingTop: space.md, paddingBottom: space.md },
  button: { borderRadius: radius.md, paddingVertical: 16, alignItems: 'center' },
  buttonLabel: { fontWeight: '700', fontSize: 16 },
});
