import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  Card,
  EmptyState,
  LoadingState,
  Screen,
  ScreenContent,
  ScreenHeader,
  SectionHeader,
} from '@/components/ui';
import { getInterest } from '@/lib/interest-catalogue';
import {
  useLearningPaths,
  useResetLearningProgress,
  useSetLearningProgress,
} from '@/hooks/use-app-data';
import { openExternalUrl } from '@/lib/links';
import { radius, space, useTheme } from '@/theme/tokens';
import type { PathStep } from '@/lib/learning-paths';

const STEP_ICONS: Record<PathStep['kind'], keyof typeof Ionicons.glyphMap> = {
  article: 'newspaper-outline',
  movie: 'film-outline',
  find: 'compass-outline',
  note: 'create-outline',
};

export default function LearningScreen() {
  const theme = useTheme();
  const learning = useLearningPaths();
  const setProgress = useSetLearningProgress();
  const resetProgress = useResetLearningProgress();
  const [busyKey, setBusyKey] = useState<string | null>(null);

  function toggle(step: PathStep) {
    setBusyKey(step.key);
    setProgress.mutate(
      { key: step.key, done: !step.done },
      { onSettled: () => setBusyKey(null) },
    );
  }

  if (learning.isLoading) {
    return <Screen><LoadingState label="Building your paths…" /></Screen>;
  }

  return (
    <Screen>
      <ScrollView>
        <ScreenContent>
          <ScreenHeader
            title="Learning Paths"
            subtitle="Turn what you saved into a guided route through a topic."
          />

          {learning.paths.length === 0 ? (
            <EmptyState
              icon="library-outline"
              title="No paths yet"
              message="Choose interests in your profile and save a few items to build a path."
              actionLabel="Open profile"
              onAction={() => router.push('/profile')}
            />
          ) : (
            learning.paths.map((path) => {
              const percent = path.total > 0 ? Math.round((path.completed / path.total) * 100) : 0;
              const interest = getInterest(path.interest);

              return (
                <Card key={path.id}>
                  <View style={styles.pathHeader}>
                    <View style={[styles.pathIcon, { backgroundColor: theme.primarySoft }]}>
                      <Ionicons name="library-outline" size={20} color={interest.color} />
                    </View>
                    <View style={styles.flex}>
                      <Text style={[styles.pathTitle, { color: theme.text }]}>{path.title}</Text>
                      <Text style={[styles.meta, { color: theme.textMuted }]}>
                        {path.completed} of {path.total} steps · {percent}%
                      </Text>
                    </View>
                  </View>

                  <Text style={[styles.description, { color: theme.textMuted }]}>
                    {path.description}
                  </Text>

                  <View style={[styles.track, { backgroundColor: theme.surfaceAlt }]}>
                    <View style={[styles.fill, { backgroundColor: interest.color, width: `${percent}%` }]} />
                  </View>

                  {path.steps.map((step, index) => (
                    <View key={step.key} style={styles.step}>
                      <Pressable
                        onPress={() => toggle(step)}
                        disabled={busyKey === step.key}
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked: step.done }}
                        accessibilityLabel={`Mark ${step.title} ${step.done ? 'incomplete' : 'complete'}`}
                        style={[
                          styles.check,
                          {
                            borderColor: step.done ? interest.color : theme.border,
                            backgroundColor: step.done ? interest.color : theme.surface,
                          },
                        ]}>
                        {step.done ? <Ionicons name="checkmark" size={15} color="#fff" /> : null}
                      </Pressable>

                      <View style={styles.flex}>
                        <View style={styles.stepTitleRow}>
                          <Ionicons
                            name={STEP_ICONS[step.kind]}
                            size={14}
                            color={theme.textMuted}
                          />
                          <Text
                            accessibilityRole={step.url ? 'link' : undefined}
                            onPress={step.url ? () => openExternalUrl(step.url!) : undefined}
                            numberOfLines={2}
                            style={[
                              styles.stepTitle,
                              { color: step.done ? theme.textMuted : theme.text },
                              step.done && styles.doneText,
                            ]}>
                            {index + 1}. {step.title}
                          </Text>
                        </View>
                        <Text style={[styles.meta, { color: theme.textMuted }]}>{step.subtitle}</Text>
                      </View>
                    </View>
                  ))}

                  <Pressable
                    accessibilityRole="button"
                    onPress={() => resetProgress.mutate('')}
                    style={styles.reset}>
                    <Text style={{ color: theme.primary, fontSize: 12, fontWeight: '600' }}>
                      Reset all progress
                    </Text>
                  </Pressable>
                </Card>
              );
            })
          )}

          <SectionHeader title="How it works" />
          <Card>
            <Text style={[styles.description, { color: theme.textMuted }]}>
              Each path collects the articles, movies and discoveries you saved in one topic. Work
              through the steps in order and tick them off — progress is stored on your device.
              Add your own notes from the Capture screen and they become steps too.
            </Text>
            <Text
              accessibilityRole="link"
              onPress={() => router.push('/saved')}
              style={[styles.link, { color: theme.primary }]}>
              Go to saved items →
            </Text>
          </Card>
        </ScreenContent>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  pathHeader: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  pathIcon: { width: 40, height: 40, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  flex: { flex: 1 },
  pathTitle: { fontSize: 16, fontWeight: '700' },
  meta: { fontSize: 11, fontWeight: '600', marginTop: 3 },
  description: { fontSize: 13, lineHeight: 19, marginTop: 10 },
  track: { height: 8, borderRadius: 4, marginTop: 14, overflow: 'hidden' },
  fill: { height: 8, borderRadius: 4 },
  step: { flexDirection: 'row', gap: space.md, alignItems: 'flex-start', marginTop: 14 },
  check: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  stepTitleRow: { flexDirection: 'row', gap: 6, alignItems: 'flex-start' },
  stepTitle: { flex: 1, fontSize: 13, fontWeight: '600', lineHeight: 19 },
  doneText: { textDecorationLine: 'line-through' },
  reset: { marginTop: 16, alignSelf: 'flex-start', paddingVertical: 4 },
  link: { fontSize: 13, fontWeight: '700', marginTop: 12 },
});
