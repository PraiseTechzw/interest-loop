import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { ScrollView, StyleSheet, Text, View, useColorScheme } from 'react-native';

import { Card, Screen, ScreenContent, ScreenHeader, SectionHeader } from '@/components/ui';
import { useTheme } from '@/theme/tokens';

export default function AccessibilityScreen() {
  const theme = useTheme();
  const scheme = useColorScheme();

  return (
    <Screen>
      <Stack.Screen options={{ title: 'Accessibility' }} />
      <ScrollView>
        <ScreenContent>
          <ScreenHeader title="Accessibility" subtitle="Current system settings and what the app supports." />

          <SectionHeader title="System" />
          <Card>
            <View style={styles.row}>
              <Ionicons name="contrast-outline" size={20} color={theme.primary} />
              <Text style={[styles.label, { color: theme.text }]}>Colour scheme</Text>
              <Text style={{ color: theme.textMuted }}>{scheme ?? 'system'}</Text>
            </View>
            <Text style={[styles.note, { color: theme.textMuted }]}>
              InterestLoop follows your system light/dark setting automatically.
            </Text>
          </Card>

          <SectionHeader title="What is supported" />
          <Card>
            {[
              'Labelled buttons, links and checkboxes for screen readers',
              'Large touch targets on interactive controls',
              'Reduced-motion friendly layout (no decorative animations)',
              'Readable contrast in both light and dark themes',
              'System font sizing is respected by React Native text',
            ].map((item) => (
              <View key={item} style={styles.row}>
                <Ionicons name="checkmark-circle" size={18} color={theme.success} />
                <Text style={[styles.item, { color: theme.text }]}>{item}</Text>
              </View>
            ))}
          </Card>

          <SectionHeader title="Need help?" />
          <Card>
            <Text style={[styles.note, { color: theme.textMuted }]}>
              If something is difficult to read or use, send details from the Feedback screen. Include your device, system font size and colour scheme.
            </Text>
          </Card>
        </ScreenContent>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  label: { flex: 1, fontWeight: '600' },
  item: { flex: 1, fontSize: 13, lineHeight: 18 },
  note: { fontSize: 12, lineHeight: 18 },
});
