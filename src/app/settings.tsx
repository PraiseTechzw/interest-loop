import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Card, NoticeBanner, Screen, ScreenContent, ScreenHeader, SectionHeader } from '@/components/ui';
import { useClearUserData } from '@/hooks/use-app-data';
import { openExternalUrl } from '@/lib/links';
import { getDataSources, sourceStatusLabel } from '@/lib/sources';
import { radius, space, useTheme } from '@/theme/tokens';

export default function SettingsScreen() {
  const theme = useTheme();
  const clearData = useClearUserData();

  const privacyUrl = process.env.EXPO_PUBLIC_PRIVACY_URL?.trim();
  const version = Constants.expoConfig?.version ?? '1.2.0';

  const sources = getDataSources();
  const allConnected = sources.every((source) => source.connected);

  function confirmClear() {
    Alert.alert(
      'Clear local data?',
      'Saved articles, movies, discoveries, prompts, reflections and learning progress will be removed from this device. Your interests are kept.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: () => clearData.mutate() },
      ],
    );
  }

  return (
    <Screen>
      <ScrollView>
        <ScreenContent>
          <ScreenHeader title="Settings" subtitle="Connection status, privacy and local data." />

          {!allConnected ? (
            <NoticeBanner message="Some live sources are not connected. Run npm run env:check before launching, and configure keys in EAS for installed builds." />
          ) : null}

          <SectionHeader title="Live sources" />
          <Card>
            {sources.map((source) => (
              <View key={source.label} style={styles.row}>
                <Ionicons
                  name={source.connected ? 'checkmark-circle' : 'alert-circle-outline'}
                  size={18}
                  color={source.connected ? theme.success : theme.textMuted}
                />
                <Text style={[styles.rowLabel, { color: theme.text }]}>{source.label}</Text>
                <Text
                  style={{
                    color: source.connected ? theme.success : theme.textMuted,
                    fontWeight: '700',
                    fontSize: 12,
                  }}>
                  {sourceStatusLabel(source.connected)}
                </Text>
              </View>
            ))}
            <Text style={[styles.helper, { color: theme.textMuted }]}>
              Keys are read from .env at build time (EXPO_PUBLIC_*). Restart Expo with a cleared cache after editing .env.
            </Text>
          </Card>

          <SectionHeader title="About" />
          <Card>
            <View style={styles.row}>
              <Text style={[styles.rowLabel, { color: theme.text }]}>InterestLoop</Text>
              <Text style={{ color: theme.textMuted, fontSize: 12 }}>v{version}</Text>
            </View>
            <Text style={[styles.helper, { color: theme.textMuted }]}>Platform: {Platform.OS}</Text>
            <Text
              accessibilityRole="link"
              onPress={() => router.push('/credits')}
              style={[styles.link, { color: theme.primary }]}>
              Credits & attributions →
            </Text>
          </Card>

          <SectionHeader title="Privacy" />
          <Card>
            <Text style={[styles.helper, { color: theme.textMuted }]}>
              Your saved items, prompts and reflections stay on this device. Live feeds are fetched from third-party APIs. No account or server sync is used.
            </Text>
            {privacyUrl ? (
              <Text
                accessibilityRole="link"
                onPress={() => openExternalUrl(privacyUrl)}
                style={[styles.link, { color: theme.primary }]}>
                Open privacy policy →
              </Text>
            ) : (
              <Text
                accessibilityRole="link"
                onPress={() => router.push('/privacy')}
                style={[styles.link, { color: theme.primary }]}>
                Read privacy summary →
              </Text>
            )}
          </Card>

          <SectionHeader title="Local data" />
          <Card>
            <Text style={[styles.helper, { color: theme.textMuted }]}>
              Clear everything you saved and all reflections from this device. This cannot be undone.
            </Text>
            <Pressable
              accessibilityRole="button"
              disabled={clearData.isPending}
              onPress={confirmClear}
              style={[styles.dangerButton, { borderColor: theme.danger }, clearData.isPending && { opacity: 0.5 }]}>
              <Text style={{ color: theme.danger, fontWeight: '700' }}>
                {clearData.isPending ? 'Clearing…' : 'Clear local data'}
              </Text>
            </Pressable>
            {clearData.isError ? (
              <Text style={[styles.helper, { color: theme.danger }]}>Could not clear data. Try again.</Text>
            ) : null}
          </Card>
        </ScreenContent>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, marginBottom: 12 },
  rowLabel: { flex: 1, fontSize: 14, fontWeight: '600' },
  helper: { fontSize: 12, lineHeight: 18, marginTop: 8 },
  link: { fontSize: 13, fontWeight: '700', marginTop: 12 },
  dangerButton: { borderWidth: 1, borderRadius: radius.md, paddingVertical: 11, alignItems: 'center', marginTop: 14 },
});
