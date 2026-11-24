import Ionicons from '@expo/vector-icons/Ionicons';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Card, NoticeBanner, Screen, ScreenContent, ScreenHeader, SectionHeader } from '@/components/ui';
import {
  CUSTOM_INTEREST_COLORS,
  CUSTOM_INTEREST_ICONS,
  makeCustomInterest,
  type InterestIcon,
} from '@/constants/interests';
import {
  useAddCustomInterest,
  useDeleteCustomInterest,
  useInterestCatalogue,
  useInterests,
  useSetInterest,
} from '@/hooks/use-app-data';
import { radius, space, useTheme } from '@/theme/tokens';

export default function InterestsScreen() {
  const theme = useTheme();
  const catalogue = useInterestCatalogue();
  const interests = useInterests();
  const add = useAddCustomInterest();
  const remove = useDeleteCustomInterest();
  const toggle = useSetInterest();

  const [label, setLabel] = useState('');
  const [keywords, setKeywords] = useState('');
  const [color, setColor] = useState(CUSTOM_INTEREST_COLORS[0]);
  const [icon, setIcon] = useState<InterestIcon>('star-outline');
  const [error, setError] = useState('');

  const selected = new Set(interests.data ?? []);
  const topics = catalogue.data ?? [];

  function create() {
    const name = label.trim();
    if (name.length < 2) {
      setError('Give your topic a name of at least 2 characters.');
      return;
    }
    if (topics.some((topic) => topic.label.toLowerCase() === name.toLowerCase())) {
      setError('You already have a topic with that name.');
      return;
    }
    setError('');
    add.mutate(
      makeCustomInterest({
        id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        label: name,
        color,
        icon,
        newsQuery: keywords.trim() || name,
      }),
    );
    setLabel('');
    setKeywords('');
  }

  return (
    <Screen>
      <Stack.Screen options={{ title: 'My topics' }} />
      <ScrollView>
        <ScreenContent>
          <ScreenHeader
            title="My topics"
            subtitle="Your interests, plus anything you care about that we didn't think of."
          />

          <SectionHeader title="Create your own" />
          <Card>
            <Text style={[styles.label, { color: theme.text }]}>Topic name</Text>
            <TextInput
              value={label}
              onChangeText={setLabel}
              placeholder="e.g. Vintage watches, My side project"
              placeholderTextColor={theme.textMuted}
              maxLength={40}
              accessibilityLabel="Topic name"
              style={[styles.input, { color: theme.text, backgroundColor: theme.background, borderColor: theme.border }]}
            />

            <Text style={[styles.label, { color: theme.text }]}>News keywords (optional)</Text>
            <TextInput
              value={keywords}
              onChangeText={setKeywords}
              placeholder="Words to look for in the news"
              placeholderTextColor={theme.textMuted}
              maxLength={120}
              accessibilityLabel="News keywords"
              style={[styles.input, { color: theme.text, backgroundColor: theme.background, borderColor: theme.border }]}
            />

            <Text style={[styles.label, { color: theme.text }]}>Colour</Text>
            <View style={styles.swatches}>
              {CUSTOM_INTEREST_COLORS.map((swatch) => (
                <Pressable
                  key={swatch}
                  accessibilityRole="button"
                  accessibilityLabel={`Colour ${swatch}`}
                  onPress={() => setColor(swatch)}
                  style={[
                    styles.swatch,
                    { backgroundColor: swatch },
                    color === swatch && { borderColor: theme.text, borderWidth: 2 },
                  ]}
                />
              ))}
            </View>

            <Text style={[styles.label, { color: theme.text }]}>Icon</Text>
            <View style={styles.icons}>
              {CUSTOM_INTEREST_ICONS.map((item) => (
                <Pressable
                  key={item}
                  accessibilityRole="button"
                  accessibilityLabel={`Icon ${item}`}
                  onPress={() => setIcon(item)}
                  style={[
                    styles.iconButton,
                    { borderColor: icon === item ? theme.primary : theme.border },
                  ]}>
                  <Ionicons name={item} size={18} color={icon === item ? theme.primary : theme.textMuted} />
                </Pressable>
              ))}
            </View>

            {error ? <Text style={[styles.error, { color: theme.danger }]}>{error}</Text> : null}
            {add.isError ? <Text style={[styles.error, { color: theme.danger }]}>Could not save that topic.</Text> : null}

            <Pressable
              accessibilityRole="button"
              disabled={add.isPending}
              onPress={create}
              style={[styles.button, { backgroundColor: theme.primary }, add.isPending && { opacity: 0.6 }]}>
              <Text style={[styles.buttonLabel, { color: theme.onPrimary }]}>
                {add.isPending ? 'Adding…' : 'Add topic'}
              </Text>
            </Pressable>
          </Card>

          <NoticeBanner message="Custom topics join News with your keywords. Add a movie genre in a backup file if you want film picks too — everything else works straight away." />

          <SectionHeader title="All topics" />
          {topics.map((topic) => {
            const isSelected = selected.has(topic.id);
            return (
              <Card key={topic.id} style={styles.topicRow}>
                <View style={[styles.topicDot, { backgroundColor: topic.color }]}>
                  <Ionicons name={topic.icon} size={16} color="#fff" />
                </View>
                <View style={styles.topicText}>
                  <Text style={[styles.topicTitle, { color: theme.text }]}>{topic.label}</Text>
                  <Text style={{ color: theme.textMuted, fontSize: 12 }}>
                    {topic.custom ? 'Your topic' : 'Built in'}
                  </Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${isSelected ? 'Remove' : 'Add'} ${topic.label} ${isSelected ? 'from' : 'to'} your loop`}
                  onPress={() => toggle.mutate({ tag: topic.id, selected: !isSelected })}
                  style={[styles.smallButton, { borderColor: theme.border }]}>
                  <Ionicons
                    name={isSelected ? 'checkmark-circle' : 'add-circle-outline'}
                    size={18}
                    color={isSelected ? theme.success : theme.primary}
                  />
                </Pressable>
                {topic.custom ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Delete ${topic.label}`}
                    onPress={() => remove.mutate(topic.id)}
                    style={styles.smallButton}>
                    <Ionicons name="trash-outline" size={18} color={theme.danger} />
                  </Pressable>
                ) : null}
              </Card>
            );
          })}
        </ScreenContent>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: '700', marginTop: 12, marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 12, padding: 12, fontSize: 14 },
  swatches: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  swatch: { width: 28, height: 28, borderRadius: 14 },
  icons: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  iconButton: { width: 38, height: 38, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  error: { fontSize: 12, marginTop: 10 },
  button: { borderRadius: 12, paddingVertical: 13, alignItems: 'center', marginTop: 16 },
  buttonLabel: { fontSize: 14, fontWeight: '700' },
  topicRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginBottom: 8 },
  topicDot: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  topicText: { flex: 1 },
  topicTitle: { fontSize: 14, fontWeight: '700' },
  smallButton: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: radius.sm },
});
