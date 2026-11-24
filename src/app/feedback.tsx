import { Stack } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Card, EmptyState, Screen, ScreenContent, ScreenHeader, SectionHeader } from '@/components/ui';
import { useAddFeedback, useFeedback } from '@/hooks/use-app-data';
import { formatDate } from '@/lib/format';
import { openExternalUrl } from '@/lib/links';
import { radius, useTheme } from '@/theme/tokens';
import { useState } from 'react';

const CATEGORIES = ['bug', 'idea', 'content', 'other'];

export default function FeedbackScreen() {
  const theme = useTheme();
  const feedback = useFeedback();
  const add = useAddFeedback();
  const [category, setCategory] = useState('bug');
  const [message, setMessage] = useState('');

  return (
    <Screen>
      <Stack.Screen options={{ title: 'Feedback' }} />
      <ScrollView>
        <ScreenContent>
          <ScreenHeader title="Feedback" subtitle="Jot down what to improve. Notes stay private on this device." />

          <Card>
            <SectionHeader title="Category" />
            <View style={styles.categories}>
              {CATEGORIES.map((item) => (
                <Pressable
                  key={item}
                  accessibilityRole="button"
                  onPress={() => setCategory(item)}
                  style={[
                    styles.chip,
                    { borderColor: category === item ? theme.primary : theme.border, backgroundColor: category === item ? theme.primarySoft : theme.surface },
                  ]}>
                  <Text style={{ color: category === item ? theme.primary : theme.text, fontWeight: '600' }}>{item}</Text>
                </Pressable>
              ))}
            </View>
            <TextInput
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={4}
              placeholder="What happened? What would you like to see?"
              placeholderTextColor={theme.textMuted}
              textAlignVertical="top"
              accessibilityLabel="Your feedback"
              style={[styles.input, { backgroundColor: theme.surfaceAlt, borderColor: theme.border, color: theme.text }]}
            />
            <Pressable
              accessibilityRole="button"
              disabled={message.trim().length < 4 || add.isPending}
              onPress={() => {
                add.mutate({ category, message: message.trim() });
                setMessage('');
              }}
              style={[styles.button, { backgroundColor: theme.primary }, message.trim().length < 4 && { opacity: 0.5 }]}>
              <Text style={{ color: theme.onPrimary, fontWeight: '700' }}>Save note</Text>
            </Pressable>
            <Text
              accessibilityRole="link"
              onPress={() => openExternalUrl('https://github.com/PraiseTechzw/interest-loop/issues/new/choose')}
              style={[styles.link, { color: theme.primary }]}>
              Or open a GitHub issue →
            </Text>
          </Card>

          <SectionHeader title="Your previous feedback" />
          {(feedback.data ?? []).length === 0 ? (
            <EmptyState title="Nothing sent yet" message="Your feedback will appear here." />
          ) : (
            feedback.data!.map((item) => (
              <Card key={item.id}>
                <Text style={{ color: theme.primary, fontSize: 12, fontWeight: '700' }}>
                  {item.category} · {formatDate(item.created_at)}
                </Text>
                <Text style={{ color: theme.text, fontSize: 14, lineHeight: 20, marginTop: 8 }}>{item.message}</Text>
              </Card>
            ))
          )}
        </ScreenContent>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  categories: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  chip: { borderWidth: 1, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 7 },
  input: { borderWidth: 1, borderRadius: 12, padding: 12, minHeight: 100, fontSize: 14 },
  button: { borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginTop: 12 },
  link: { fontSize: 13, fontWeight: '700', marginTop: 14, textAlign: 'center' },
});
