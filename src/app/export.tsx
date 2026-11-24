import * as Clipboard from 'expo-clipboard';
import { Stack } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { Card, LoadingState, Screen, ScreenContent, ScreenHeader } from '@/components/ui';
import { exportUserData } from '@/lib/database';
import { useSQLiteContext } from 'expo-sqlite';
import { useQuery } from '@tanstack/react-query';
import { radius, useTheme } from '@/theme/tokens';

export default function ExportScreen() {
  const theme = useTheme();
  const db = useSQLiteContext();
  const data = useQuery({ queryKey: ['export-data'], queryFn: () => exportUserData(db) });

  async function copy() {
    if (!data.data) return;
    await Clipboard.setStringAsync(JSON.stringify(data.data, null, 2));
    Alert.alert('Copied', 'Your data JSON was copied to the clipboard.');
  }

  return (
    <Screen>
      <Stack.Screen options={{ title: 'Export data' }} />
      <ScrollView>
        <ScreenContent>
          <ScreenHeader title="Export data" subtitle="Take your data with you as JSON." />
          {data.isLoading ? (
            <LoadingState label="Preparing export…" />
          ) : (
            <Card>
              <Text style={{ color: theme.text, fontSize: 14, lineHeight: 20 }}>
                Includes interests, profile, saved items, prompts, reflections, learning progress, capsules and feedback. No key values are included.
              </Text>
              <Text style={{ color: theme.textMuted, fontSize: 12, marginTop: 10 }}>
                {data.data ? `${JSON.stringify(data.data).length} characters` : ''}
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={copy}
                style={[styles.button, { backgroundColor: theme.primary }]}>
                <Text style={{ color: theme.onPrimary, fontWeight: '700' }}>Copy JSON</Text>
              </Pressable>
            </Card>
          )}
        </ScreenContent>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  button: { borderRadius: radius.md, paddingVertical: 12, alignItems: 'center', marginTop: 18 },
});
