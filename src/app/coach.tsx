import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  Pressable,
  View,
} from 'react-native';

import {
  Card,
  EmptyState,
  ErrorState,
  LoadingState,
  Pill,
  Screen,
  ScreenContent,
  ScreenHeader,
  SectionHeader,
} from '@/components/ui';
import { DEMO_PROMPTS } from '@/data/demo';
import {
  useCoachResponses,
  useDeleteCoachResponse,
  useReviewCoachResponse,
  useSaveCoachResponse,
} from '@/hooks/use-app-data';
import { formatDate } from '@/lib/format';
import { radius, space, useTheme } from '@/theme/tokens';
import type { MindsetPrompt, PromptCategory } from '@/types/models';

type Filter = 'all' | PromptCategory;

const CATEGORIES: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'first-principles', label: 'First principles' },
  { id: 'inversion', label: 'Inversion' },
  { id: 'second-order', label: 'Second order' },
  { id: 'occam', label: "Occam's razor" },
];

const CATEGORY_LABEL: Record<PromptCategory, string> = {
  'first-principles': 'First principles',
  inversion: 'Inversion',
  'second-order': 'Second-order effects',
  occam: "Occam's razor",
};

export default function CoachScreen() {
  const theme = useTheme();
  const responses = useCoachResponses();
  const saveResponse = useSaveCoachResponse();
  const review = useReviewCoachResponse();
  const remove = useDeleteCoachResponse();
  const [filter, setFilter] = useState<Filter>('all');
  const [answer, setAnswer] = useState('');
  const [cursor, setCursor] = useState(0);

  // Query metadata gives us a stable timestamp without impure Date.now() calls in render.
  const now = responses.dataUpdatedAt;

  const byId = useMemo(
    () => new Map((responses.data ?? []).map((entry) => [entry.promptId, entry])),
    [responses.data],
  );

  const prompts = useMemo(() => {
    const filtered = DEMO_PROMPTS.filter((p) => filter === 'all' || p.category === filter);
    return [...filtered].sort((a, b) => {
      const aDone = byId.has(a.id) ? 1 : 0;
      const bDone = byId.has(b.id) ? 1 : 0;
      return aDone - bDone;
    });
  }, [filter, byId]);

  const current: MindsetPrompt | undefined = prompts[cursor % Math.max(prompts.length, 1)];
  const isDue = (nextReviewAt: string) => now > 0 && new Date(nextReviewAt).getTime() <= now;
  const dueCount = (responses.data ?? []).filter((entry) => isDue(entry.nextReviewAt)).length;

  function nextPrompt() {
    setCursor((value) => value + 1);
    setAnswer('');
  }

  if (responses.isLoading) return <Screen><LoadingState label="Loading your reflections…" /></Screen>;

  return (
    <Screen>
      <ScrollView keyboardShouldPersistTaps="handled">
        <ScreenContent>
          <ScreenHeader
            title="Mindset Coach"
            subtitle="One small question a day can change how you see everything."
          />

          <View style={styles.stats}>
            <View style={[styles.stat, { backgroundColor: theme.primarySoft }]}>
              <Text style={[styles.statValue, { color: theme.primary }]}>{responses.data?.length ?? 0}</Text>
              <Text style={[styles.statLabel, { color: theme.textMuted }]}>Reflections</Text>
            </View>
            <View style={[styles.stat, { backgroundColor: theme.surfaceAlt }]}>
              <Text style={[styles.statValue, { color: theme.text }]}>{dueCount}</Text>
              <Text style={[styles.statLabel, { color: theme.textMuted }]}>Due for review</Text>
            </View>
          </View>

          <View style={styles.filters}>
            {CATEGORIES.map((category) => (
              <Pill
                key={category.id}
                label={category.label}
                selected={filter === category.id}
                onPress={() => {
                  setFilter(category.id);
                  setCursor(0);
                }}
              />
            ))}
          </View>

          {current ? (
            <Card>
              <View style={styles.badgeRow}>
                <View style={[styles.badge, { backgroundColor: theme.primarySoft }]}>
                  <Text style={[styles.badgeText, { color: theme.primary }]}>
                    {CATEGORY_LABEL[current.category]}
                  </Text>
                </View>
                {byId.has(current.id) ? (
                  <Text style={[styles.meta, { color: theme.success }]}>Answered</Text>
                ) : null}
              </View>

              <Text style={[styles.prompt, { color: theme.text }]}>{current.prompt}</Text>
              <Text style={[styles.hint, { color: theme.textMuted }]}>💡 {current.hint}</Text>

              <TextInput
                value={answer}
                onChangeText={setAnswer}
                multiline
                numberOfLines={4}
                placeholder="Write what comes to mind…"
                placeholderTextColor={theme.textMuted}
                textAlignVertical="top"
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.surfaceAlt,
                    borderColor: theme.border,
                    color: theme.text,
                  },
                ]}
                accessibilityLabel="Your reflection"
              />

              <View style={styles.buttonRow}>
                <Pressable
                  onPress={nextPrompt}
                  accessibilityRole="button"
                  style={[styles.secondaryButton, { borderColor: theme.border }]}>
                  <Text style={{ color: theme.text, fontWeight: '600' }}>Skip</Text>
                </Pressable>
                <Pressable
                  disabled={answer.trim().length === 0 || saveResponse.isPending}
                  onPress={() => {
                    saveResponse.mutate({
                      promptId: current.id,
                      response: answer.trim(),
                      category: current.category,
                    });
                    nextPrompt();
                  }}
                  accessibilityRole="button"
                  style={[
                    styles.primaryButton,
                    { backgroundColor: theme.primary },
                    (answer.trim().length === 0 || saveResponse.isPending) && { opacity: 0.5 },
                  ]}>
                  <Text style={{ color: theme.onPrimary, fontWeight: '700' }}>Save reflection</Text>
                </Pressable>
              </View>
            </Card>
          ) : (
            <EmptyState title="No prompts" message="Try a different category." />
          )}

          <SectionHeader title="Your reflections" />
          {responses.isError ? (
            <ErrorState message="Could not load reflections." onRetry={() => responses.refetch()} />
          ) : (responses.data ?? []).length === 0 ? (
            <EmptyState
              icon="bulb-outline"
              title="Start with one thought"
              message="Answer a prompt above. Your responses are saved on this device and scheduled for review."
            />
          ) : (
            (responses.data ?? []).map((entry) => {
              const prompt = DEMO_PROMPTS.find((p) => p.id === entry.promptId);
              const due = isDue(entry.nextReviewAt);
              return (
                <Card key={entry.promptId}>
                  <Text style={[styles.meta, { color: theme.primary }]}>
                    {CATEGORY_LABEL[entry.category]} · updated {formatDate(entry.updatedAt)}
                  </Text>
                  <Text style={[styles.reflection, { color: theme.text }]}>“{entry.response}”</Text>
                  {prompt ? (
                    <Text style={[styles.hint, { color: theme.textMuted }]} numberOfLines={2}>
                      {prompt.prompt}
                    </Text>
                  ) : null}
                  <Text style={[styles.meta, { color: due ? theme.accent : theme.textMuted }]}>
                    {due ? 'Due for review' : `Next review ${formatDate(entry.nextReviewAt)}`} ·{' '}
                    {entry.reviewCount} reviews · {entry.intervalDays}d interval
                  </Text>
                  <View style={styles.buttonRow}>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => review.mutate({ promptId: entry.promptId, again: true })}
                      style={[styles.secondaryButton, { borderColor: theme.border }]}>
                      <Text style={{ color: theme.text, fontWeight: '600' }}>Again</Text>
                    </Pressable>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => review.mutate({ promptId: entry.promptId, again: false })}
                      style={[styles.secondaryButton, { borderColor: theme.border }]}>
                      <Text style={{ color: theme.text, fontWeight: '600' }}>Got it</Text>
                    </Pressable>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Delete reflection"
                      onPress={() => remove.mutate(entry.promptId)}
                      style={styles.iconButton}>
                      <Ionicons name="trash-outline" size={18} color={theme.danger} />
                    </Pressable>
                  </View>
                </Card>
              );
            })
          )}
        </ScreenContent>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stats: { flexDirection: 'row', gap: space.md, marginBottom: space.lg },
  stat: { flex: 1, borderRadius: radius.md, padding: space.md, alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 11, marginTop: 2 },
  filters: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: space.md },
  badgeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  badge: { borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 5 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  meta: { fontSize: 11, fontWeight: '600' },
  prompt: { fontSize: 19, fontWeight: '700', lineHeight: 26, marginTop: space.md },
  hint: { fontSize: 13, lineHeight: 19, marginTop: space.sm },
  input: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: space.md,
    marginTop: space.lg,
    minHeight: 100,
    fontSize: 14,
    lineHeight: 20,
  },
  buttonRow: { flexDirection: 'row', gap: space.sm, marginTop: space.md, alignItems: 'center' },
  primaryButton: { flex: 1, borderRadius: radius.md, paddingVertical: 12, alignItems: 'center' },
  secondaryButton: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  iconButton: { padding: 10 },
  reflection: { fontSize: 14, lineHeight: 20, fontStyle: 'italic', marginTop: 6 },
});
