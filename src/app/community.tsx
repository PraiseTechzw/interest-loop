import { router, Stack } from 'expo-router';
import { ScrollView, Text } from 'react-native';

import { Card, EmptyState, Screen, ScreenContent, ScreenHeader, SectionHeader } from '@/components/ui';
import { useCapsules, useDeleteCapsule } from '@/hooks/use-app-data';
import { formatDate } from '@/lib/format';
import { useTheme } from '@/theme/tokens';

export default function CommunityScreen() {
  const theme = useTheme();
  const capsules = useCapsules();
  const remove = useDeleteCapsule();

  return (
    <Screen>
      <Stack.Screen options={{ title: 'Community' }} />
      <ScrollView>
        <ScreenContent>
          <ScreenHeader
            title="Community"
            subtitle="Your saved time capsules. Sharing with others needs a backend and is not enabled yet."
          />
          <SectionHeader title="Saved capsules" />
          {(capsules.data ?? []).length === 0 ? (
            <EmptyState
              icon="hourglass-outline"
              title="No capsules saved"
              message="Create one from the Time Capsule screen and it will appear here."
              actionLabel="Create capsule"
              onAction={() => router.push('/capsule')}
            />
          ) : (
            capsules.data!.map((capsule) => (
              <Card key={capsule.id}>
                <Text style={{ color: theme.primary, fontSize: 12, fontWeight: '700' }}>
                  {formatDate(capsule.created_at)}
                </Text>
                <Text style={{ color: theme.textMuted, fontSize: 13, lineHeight: 19, marginTop: 8 }}>
                  {capsule.summary}
                </Text>
                <Text
                  accessibilityRole="button"
                  onPress={() => remove.mutate(capsule.id)}
                  style={{ color: theme.danger, fontWeight: '700', fontSize: 13, marginTop: 12 }}>
                  Remove
                </Text>
              </Card>
            ))
          )}
        </ScreenContent>
      </ScrollView>
    </Screen>
  );
}
