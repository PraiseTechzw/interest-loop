import Ionicons from '@expo/vector-icons/Ionicons';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

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
import {
  useAddMindsetPrompt,
  useCoachResponses,
  useDeleteCoachResponse,
  useDeleteMindsetPrompt,
  useMindsetPrompts,
  useReviewCoachResponse,
  useSaveCoachResponse,
} from '@/hooks/use-app-data';
import { formatDate, parseDate } from '@/lib/format';
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
  const promptsQuery = useMindsetPrompts();
  const responses = useCoachResponses();
  const saveResponse = useSaveCoachResponse();
  const review = useReviewCoachResponse();
  const removeResponse = useDeleteCoachResponse();
  const addPrompt = useAddMindsetPrompt();
  const removePrompt = useDeleteMindsetPrompt();

  const [filter, setFilter] = useState<Filter>('all');
  const [answer, setAnswer] = useState('');
  const [cursor, setCursor] = useState(0);
  const [draft, setDraft] = useState('');
  const [hintDraft, setHintDraft] = useState('');
  const [draftCategory, setDraftCategory] = useState<PromptCategory>('first-principles');

  const clock = useQuery({
    queryKey: ['now'],
    queryFn: () => Date.now(),
    staleTime: 60_000,
    refetchInterval: 60_000,
  });
  const now = clock.data ?? responses.dataUpdatedAt;
  const isDue = (nextReviewAt: string) => now > 0 && parseDate(nextReviewAt).getTime() <= now;

  const prompts = useMemo(() => {
    const all = promptsQuery.data ?? [];
    const filtered = all.filter((p) => filter === 'all' || p.category === filter);
    return [...filtered].sort((a, b) => {
      const answered = new Set((responses.data ?? []).map((entry) => entry.promptId));
      return (answered.has(a.id) ? 1 : 0) - (answered.has(b.id) ? 1 : 0);
    });
  }, [promptsQuery.data, responses.data, filter]);

  const promptById = useMemo(
    () => new Map((promptsQuery.data ?? []).map((prompt) => [prompt.id, prompt])),
    [promptsQuery.data],
  );

  const current: MindsetPrompt | undefined = prompts[cursor % Math.max(prompts.length, 1)];
  const dueCount = (responses.data ?? []).filter((entry) => isDue(entry.nextReviewAt)).length;

  function nextPrompt() {
    setCursor((value) => value + 1);
    setAnswer('');
  }

  function createPrompt() {
    const text = draft.trim();
    if (!text) return;
    addPrompt.mutate(
      {
        id: `prompt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        prompt: text,
        category: draftCategory,
        hint: hintDraft.trim(),
      },
      {
        onSuccess: () => {
          setDraft('');
          setHintDraft('');
          setCursor(0);
        },
      },
    );
  }

  if (promptsQuery.isLoading || responses.isLoading) {
    return <Screen><LoadingState label="Loading your reflections…" /></Screen>;
  }

  return (
    <Screen>
      <ScrollView keyboardShouldPersistTaps="handled">
        <ScreenContent>
          <ScreenHeader
            title="Mindset Coach"
            subtitle="Write your own prompts, then reflect and review them over time."
          />

          <View style={styles.stats}>
            <View style={[styles.stat, { backgroundColor: theme.primarySoft }]}>
              <Text style={[styles.statValue, { color: theme.primary }]}>{prompts.length}</Text>
              <Text style={[styles.statLabel, { color: theme.textMuted }]}>Prompts</Text>
            </View>
            <View style={[styles.stat, { backgroundColor: theme.surfaceAlt }]}>
              <Text style={[styles.statValue, { color: theme.text }]}>{dueCount}</Text>
              <Text style={[styles.statLabel, { color: theme.textMuted }]}>Due for review</Text>
            </View>
          </View>

          <Card>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Add a prompt</Text>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              multiline
              numberOfLines={2}
              placeholder="Ask yourself a question…"
              placeholderTextColor={theme.textMuted}
              textAlignVertical="top"
              style={[styles.input, { backgroundColor: theme.surfaceAlt, borderColor: theme.border, color: theme.text }]}
              accessibilityLabel="New prompt question"
            />
            <TextInput
              value={hintDraft}
              onChangeText={setHintDraft}
              placeholder="Optional hint"
              placeholderTextColor={theme.textMuted}
              style={[styles.input, styles.hintInput, { backgroundColor: theme.surfaceAlt, borderColor: theme.border, color: theme.text }]}
              accessibilityLabel="Optional hint"
            />
            <View style={styles.filters}>
              {CATEGORIES.filter((category) => category.id !== 'all').map((category) => (
                <Pill
                  key={category.id}
                  label={category.label}
                  selected={draftCategory === category.id}
                  onPress={() => setDraftCategory(category.id as PromptCategory)}
                />
              ))}
            </View>
            <Pressable
              accessibilityRole="button"
              disabled={draft.trim().length === 0 || addPrompt.isPending}
              onPress={createPrompt}
              style={[styles.primaryButton, { backgroundColor: theme.primary }, (draft.trim().length === 0 || addPrompt.isPending) && { opacity: 0.5 }]}>
              <Text style={{ color: theme.onPrimary, fontWeight: '700' }}>Add prompt</Text>
            </Pressable>
            {addPrompt.isError ? (
              <Text style={[styles.saveError, { color: theme.danger }]}>Could not save the prompt. Try again.</Text>
            ) : null}
          </Card>

          <SectionHeader title="Your prompts" />
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

          {prompts.length === 0 ? (
            <EmptyState
              icon="bulb-outline"
              title="No prompts yet"
              message="Create your first prompt above — nothing is provided for you."
            />
          ) : current ? (
            <Card>
              <View style={styles.badgeRow}>
                <View style={[styles.badge, { backgroundColor: theme.primarySoft }]}>
                  <Text style={[styles.badgeText, { color: theme.primary }]}>
                    {CATEGORY_LABEL[current.category]}
                  </Text>
                </View>
              </View>

              <Text style={[styles.prompt, { color: theme.text }]}>{current.prompt}</Text>
              {current.hint ? (
                <View style={styles.hintRow}>
                <Ionicons name="bulb-outline" size={15} color={theme.textMuted} />
                <Text style={[styles.hint, { color: theme.textMuted }]}>{current.hint}</Text>
              </View>
              ) : null}

              <TextInput
                value={answer}
                onChangeText={setAnswer}
                multiline
                numberOfLines={4}
                placeholder="Write what comes to mind…"
                placeholderTextColor={theme.textMuted}
                textAlignVertical="top"
                style={[styles.input, { backgroundColor: theme.surfaceAlt, borderColor: theme.border, color: theme.text }]}
                accessibilityLabel="Your reflection"
              />

              <View style={styles.buttonRow}>
                <Pressable onPress={nextPrompt} accessibilityRole="button" style={[styles.secondaryButton, { borderColor: theme.border }]}>
                  <Text style={{ color: theme.text, fontWeight: '600' }}>Skip</Text>
                </Pressable>
                <Pressable
                  disabled={answer.trim().length === 0 || saveResponse.isPending}
                  onPress={() => {
                    saveResponse.mutate(
                      {
                        promptId: current.id,
                        response: answer.trim(),
                        category: current.category,
                      },
                      { onSuccess: nextPrompt },
                    );
                  }}
                  accessibilityRole="button"
                  style={[styles.primaryButton, { backgroundColor: theme.primary }, (answer.trim().length === 0 || saveResponse.isPending) && { opacity: 0.5 }]}>
                  <Text style={{ color: theme.onPrimary, fontWeight: '700' }}>Save reflection</Text>
                </Pressable>
              </View>
              {saveResponse.isError ? (
                <Text style={[styles.saveError, { color: theme.danger }]}>
                  Could not save your reflection. Your text is still here — try again.
                </Text>
              ) : null}
            </Card>
          ) : null}

          {prompts.length > 1 ? (
            <Pressable accessibilityRole="button" onPress={nextPrompt} style={styles.nextLink}>
              <Text style={{ color: theme.primary, fontWeight: '700' }}>Next prompt →</Text>
            </Pressable>
          ) : null}

          <SectionHeader title="Your reflections" />
          {responses.isError ? (
            <ErrorState message="Could not load reflections." onRetry={() => responses.refetch()} />
          ) : (responses.data ?? []).length === 0 ? (
            <EmptyState
              icon="book-outline"
              title="No reflections yet"
              message="Answer one of your prompts to start tracking your thinking."
            />
          ) : (
            (responses.data ?? []).map((entry) => {
              const prompt = promptById.get(entry.promptId);
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
                    <Pressable accessibilityRole="button" onPress={() => review.mutate({ promptId: entry.promptId, again: true })} style={[styles.secondaryButton, { borderColor: theme.border }]}>
                      <Text style={{ color: theme.text, fontWeight: '600' }}>Again</Text>
                    </Pressable>
                    <Pressable accessibilityRole="button" onPress={() => review.mutate({ promptId: entry.promptId, again: false })} style={[styles.secondaryButton, { borderColor: theme.border }]}>
                      <Text style={{ color: theme.text, fontWeight: '600' }}>Got it</Text>
                    </Pressable>
                    <Pressable accessibilityRole="button" accessibilityLabel="Delete reflection" onPress={() => removeResponse.mutate(entry.promptId)} style={styles.iconButton}>
                      <Ionicons name="trash-outline" size={18} color={theme.danger} />
                    </Pressable>
                    <Pressable accessibilityRole="button" accessibilityLabel="Delete prompt" onPress={() => removePrompt.mutate(entry.promptId)} style={styles.iconButton}>
                      <Ionicons name="close-circle-outline" size={18} color={theme.danger} />
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
  filters: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: space.md, marginTop: space.sm },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  badgeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  badge: { borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 5 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  meta: { fontSize: 11, fontWeight: '600' },
  prompt: { fontSize: 19, fontWeight: '700', lineHeight: 26, marginTop: space.md },
  hint: { flex: 1, fontSize: 13, lineHeight: 19 },
  hintRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginTop: space.sm },
  input: { borderWidth: 1, borderRadius: radius.md, padding: space.md, marginTop: space.lg, minHeight: 100, fontSize: 14, lineHeight: 20 },
  hintInput: { minHeight: 44, marginTop: space.sm },
  buttonRow: { flexDirection: 'row', gap: space.sm, marginTop: space.md, alignItems: 'center' },
  primaryButton: { borderRadius: radius.md, paddingVertical: 12, paddingHorizontal: 18, alignItems: 'center' },
  secondaryButton: { paddingHorizontal: 18, paddingVertical: 12, borderRadius: radius.md, borderWidth: 1, alignItems: 'center' },
  iconButton: { padding: 8 },
  nextLink: { alignSelf: 'flex-end', paddingVertical: 8 },
  saveError: { fontSize: 12, lineHeight: 17, marginTop: 10 },
  reflection: { fontSize: 14, lineHeight: 20, fontStyle: 'italic', marginTop: 6 },
});
