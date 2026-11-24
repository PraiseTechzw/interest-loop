import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Card, LoadingState, NoticeBanner, Screen, ScreenContent, ScreenHeader, SectionHeader } from '@/components/ui';
import {
  useInterestCatalogue,
  useRemoveNote,
  useSaveNote,
  useSavedNote,
} from '@/hooks/use-app-data';
import { radius, space, useTheme } from '@/theme/tokens';
import type { SavedNoteRow } from '@/types/models';

export default function CaptureScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const noteId = typeof id === 'string' ? id : '';
  const existing = useSavedNote(noteId);

  if (noteId && existing.isLoading) {
    return <Screen><LoadingState label="Opening your note…" /></Screen>;
  }

  return (
    <CaptureForm
      key={existing.data?.updated_at ?? noteId ?? 'new'}
      note={existing.data ?? null}
      noteId={noteId}
    />
  );
}

function CaptureForm({ note, noteId }: { note: SavedNoteRow | null; noteId: string }) {
  const theme = useTheme();
  const catalogue = useInterestCatalogue();
  const save = useSaveNote();
  const remove = useRemoveNote();

  const [title, setTitle] = useState(note?.title ?? '');
  const [body, setBody] = useState(note?.body ?? '');
  const [url, setUrl] = useState(note?.url ?? '');
  const [interest, setInterest] = useState(note?.interest_tag ?? '');
  const [error, setError] = useState('');

  const topics = catalogue.data ?? [];
  const chosenInterest = interest || topics[0]?.id || 'geek';

  function submit() {
    if (title.trim().length < 2) {
      setError('Add a short title first.');
      return;
    }
    setError('');
    save.mutate(
      { id: noteId || undefined, title, body, url, interest: chosenInterest },
      { onSuccess: () => router.back() },
    );
  }

  return (
    <Screen>
      <Stack.Screen options={{ title: noteId ? 'Edit note' : 'Capture a thought' }} />
      <ScrollView>
        <ScreenContent>
          <ScreenHeader
            title={noteId ? 'Edit note' : 'Capture a thought'}
            subtitle="An idea, a link, something you want to remember. Only you can see it."
          />

          <NoticeBanner message="Your notes stay in this app's local storage. They also become steps in Learning Paths and appear in your Time Capsule." />

          <Card>
            <Text style={[styles.label, { color: theme.text }]}>Title</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="What's on your mind?"
              placeholderTextColor={theme.textMuted}
              maxLength={120}
              accessibilityLabel="Note title"
              style={[styles.input, { color: theme.text, backgroundColor: theme.background, borderColor: theme.border }]}
            />

            <Text style={[styles.label, { color: theme.text }]}>Your thoughts</Text>
            <TextInput
              value={body}
              onChangeText={setBody}
              placeholder="Write anything…"
              placeholderTextColor={theme.textMuted}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              accessibilityLabel="Note text"
              style={[styles.input, styles.bodyInput, { color: theme.text, backgroundColor: theme.background, borderColor: theme.border }]}
            />

            <Text style={[styles.label, { color: theme.text }]}>Link (optional)</Text>
            <TextInput
              value={url}
              onChangeText={setUrl}
              placeholder="https://…"
              placeholderTextColor={theme.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              accessibilityLabel="Optional link"
              style={[styles.input, { color: theme.text, backgroundColor: theme.background, borderColor: theme.border }]}
            />
          </Card>

          <SectionHeader title="Which topic?" />
          <View style={styles.topics}>
            {topics.map((topic) => (
              <Pressable
                key={topic.id}
                accessibilityRole="button"
                accessibilityLabel={`Tag with ${topic.label}`}
                onPress={() => setInterest(topic.id)}
                style={[
                  styles.topic,
                  {
                    borderColor: chosenInterest === topic.id ? topic.color : theme.border,
                    backgroundColor: chosenInterest === topic.id ? theme.primarySoft : theme.surface,
                  },
                ]}>
                <Text style={{ color: chosenInterest === topic.id ? topic.color : theme.text, fontWeight: '700', fontSize: 13 }}>
                  {topic.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {error ? <Text style={[styles.error, { color: theme.danger }]}>{error}</Text> : null}
          {save.isError ? <Text style={[styles.error, { color: theme.danger }]}>Could not save your note.</Text> : null}

          <Pressable
            accessibilityRole="button"
            disabled={save.isPending}
            onPress={submit}
            style={[styles.button, { backgroundColor: theme.primary }, save.isPending && { opacity: 0.6 }]}>
            <Text style={[styles.buttonLabel, { color: theme.onPrimary }]}>
              {save.isPending ? 'Saving…' : noteId ? 'Save changes' : 'Save note'}
            </Text>
          </Pressable>

          {noteId ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => remove.mutate(noteId, { onSuccess: () => router.back() })}
              style={styles.delete}>
              <Text style={{ color: theme.danger, fontWeight: '700', fontSize: 13 }}>Delete note</Text>
            </Pressable>
          ) : null}
        </ScreenContent>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: '700', marginTop: 12, marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 12, padding: 12, fontSize: 14 },
  bodyInput: { minHeight: 130 },
  topics: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  topic: { borderWidth: 1, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 8 },
  error: { fontSize: 12, marginTop: 12 },
  button: { borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: space.lg },
  buttonLabel: { fontSize: 14, fontWeight: '700' },
  delete: { alignItems: 'center', paddingVertical: 16 },
});
