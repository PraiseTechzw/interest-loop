import * as Clipboard from 'expo-clipboard';
import { Stack } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useSQLiteContext } from 'expo-sqlite';
import { Alert, Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { Card, LoadingState, NoticeBanner, Screen, ScreenContent, ScreenHeader, SectionHeader } from '@/components/ui';
import { useImportBackup } from '@/hooks/use-app-data';
import { exportUserData } from '@/lib/database';
import { radius, space, useTheme } from '@/theme/tokens';

export default function ExportScreen() {
  const theme = useTheme();
  const db = useSQLiteContext();
  const data = useQuery({ queryKey: ['export-data'], queryFn: () => exportUserData(db) });
  const restore = useImportBackup();

  async function copy() {
    if (!data.data) return;
    await Clipboard.setStringAsync(JSON.stringify(data.data, null, 2));
    Alert.alert('Copied', 'Your backup JSON was copied to the clipboard. Paste it somewhere safe.');
  }

  function confirmRestore() {
    Alert.alert(
      'Restore this backup?',
      'This replaces everything currently stored in the app. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Restore', style: 'destructive', onPress: pasteAndRestore },
      ],
    );
  }

  async function pasteAndRestore() {
    const text = await Clipboard.getStringAsync();
    if (!text?.trim()) {
      Alert.alert('Nothing to restore', 'Copy a backup JSON first, then come back here.');
      return;
    }
    try {
      await restore.mutateAsync(text);
      data.refetch();
      Alert.alert('Restored', 'Your topics, notes and saved items are back.');
    } catch (error) {
      Alert.alert('Could not restore', error instanceof Error ? error.message : 'Unknown error.');
    }
  }

  return (
    <Screen>
      <Stack.Screen options={{ title: 'Backup & restore' }} />
      <ScrollView>
        <ScreenContent>
          <ScreenHeader title="Backup & restore" subtitle="Your data stays yours. Take it with you, or bring it back." />

          <NoticeBanner message="Everything here is private to this device. A backup is a plain JSON file — keep it somewhere only you can reach." />

          <SectionHeader title="Back up" />
          {data.isLoading ? (
            <LoadingState label="Preparing backup…" />
          ) : (
            <Card>
              <Text style={{ color: theme.text, fontSize: 14, lineHeight: 20 }}>
                Includes your topics, profile, saved articles, movies and finds, your own notes,
                coach prompts and reflections, learning progress, capsules and feedback. No API
                keys are included.
              </Text>
              <Text style={{ color: theme.textMuted, fontSize: 12, marginTop: 10 }}>
                {data.data ? `${JSON.stringify(data.data).length} characters` : ''}
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={copy}
                style={[styles.button, { backgroundColor: theme.primary }]}>
                <Text style={{ color: theme.onPrimary, fontWeight: '700' }}>Copy backup JSON</Text>
              </Pressable>
            </Card>
          )}

          <SectionHeader title="Restore" />
          <Card>
            <Text style={{ color: theme.text, fontSize: 14, lineHeight: 20 }}>
              Copy your backup JSON, then tap below. Restoring replaces the data currently on this
              device with the data in your backup.
            </Text>
            <Pressable
              accessibilityRole="button"
              disabled={restore.isPending}
              onPress={confirmRestore}
              style={[styles.button, { borderColor: theme.primary }, restore.isPending && { opacity: 0.6 }]}>
              <Text style={{ color: theme.primary, fontWeight: '700' }}>
                {restore.isPending ? 'Restoring…' : 'Paste from clipboard & restore'}
              </Text>
            </Pressable>
          </Card>

          <Text style={[styles.footer, { color: theme.textMuted }]}>
            Tip: paste the backup into a private note or password manager so it survives a phone
            reset.
          </Text>
        </ScreenContent>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  button: { borderRadius: radius.md, borderWidth: 1, paddingVertical: 12, alignItems: 'center', marginTop: space.md },
  footer: { fontSize: 12, lineHeight: 18, marginTop: space.lg, textAlign: 'center' },
});
