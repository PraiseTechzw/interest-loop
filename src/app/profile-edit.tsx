import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput } from 'react-native';

import { Card, LoadingState, Screen, ScreenContent, ScreenHeader } from '@/components/ui';
import { useProfile, useSetProfile } from '@/hooks/use-app-data';
import { radius, space, useTheme } from '@/theme/tokens';
import type { UserProfile } from '@/types/models';

const NAME_MAX = 40;
const BIO_MAX = 140;

function ProfileForm({ initial }: { initial: UserProfile }) {
  const theme = useTheme();
  const setProfile = useSetProfile();
  const [name, setName] = useState(initial.name);
  const [bio, setBio] = useState(initial.bio);
  const [failed, setFailed] = useState(false);

  async function save() {
    setFailed(false);
    try {
      await setProfile.mutateAsync({
        name: name.trim().slice(0, NAME_MAX),
        bio: bio.trim().slice(0, BIO_MAX),
      });
      if (router.canGoBack()) router.back();
      else router.replace('/profile');
    } catch {
      setFailed(true);
    }
  }

  return (
    <Screen>
      <ScrollView keyboardShouldPersistTaps="handled">
        <ScreenContent>
          <ScreenHeader title="Edit profile" subtitle="A little about you, kept on this device." />

          <Card>
            <Text style={[styles.label, { color: theme.text }]}>Display name</Text>
            <TextInput
              value={name}
              onChangeText={(text) => setName(text.slice(0, NAME_MAX))}
              placeholder="Your name"
              placeholderTextColor={theme.textMuted}
              maxLength={NAME_MAX}
              accessibilityLabel="Display name"
              style={[
                styles.input,
                {
                  color: theme.text,
                  backgroundColor: theme.background,
                  borderColor: theme.border,
                },
              ]}
            />
            <Text style={[styles.counter, { color: theme.textMuted }]}>
              {name.length}/{NAME_MAX}
            </Text>

            <Text style={[styles.label, { color: theme.text }]}>Short bio</Text>
            <TextInput
              value={bio}
              onChangeText={(text) => setBio(text.slice(0, BIO_MAX))}
              placeholder="What are you curious about?"
              placeholderTextColor={theme.textMuted}
              maxLength={BIO_MAX}
              multiline
              textAlignVertical="top"
              accessibilityLabel="Short bio"
              style={[
                styles.input,
                styles.bioInput,
                {
                  color: theme.text,
                  backgroundColor: theme.background,
                  borderColor: theme.border,
                },
              ]}
            />
            <Text style={[styles.counter, { color: theme.textMuted }]}>
              {bio.length}/{BIO_MAX}
            </Text>

            {failed ? (
              <Text style={[styles.error, { color: theme.danger }]}>
                Could not save your profile. Try again.
              </Text>
            ) : null}

            <Pressable
              onPress={save}
              disabled={setProfile.isPending}
              accessibilityRole="button"
              style={[
                styles.saveButton,
                { backgroundColor: theme.primary },
                setProfile.isPending && { opacity: 0.6 },
              ]}>
              <Text style={[styles.saveLabel, { color: theme.onPrimary }]}>
                {setProfile.isPending ? 'Saving…' : 'Save profile'}
              </Text>
            </Pressable>
          </Card>

          <Text style={[styles.note, { color: theme.textMuted }]}>
            Your profile is stored locally and never uploaded.
          </Text>
        </ScreenContent>
      </ScrollView>
    </Screen>
  );
}

export default function ProfileEditScreen() {
  const profile = useProfile();

  if (profile.isLoading) {
    return (
      <Screen>
        <LoadingState label="Loading your profile…" />
      </Screen>
    );
  }

  return (
    <ProfileForm
      key={`${profile.data?.name ?? ''}|${profile.data?.bio ?? ''}`}
      initial={profile.data ?? { name: '', bio: '' }}
    />
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 14, fontWeight: '700', marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    paddingVertical: 12,
    fontSize: 15,
  },
  bioInput: { minHeight: 96, lineHeight: 20 },
  counter: { fontSize: 11, textAlign: 'right', marginTop: 5, marginBottom: space.md },
  error: { fontSize: 12, marginTop: 4 },
  saveButton: {
    borderRadius: radius.md,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: space.sm,
  },
  saveLabel: { fontSize: 15, fontWeight: '700' },
  note: { fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: space.lg },
});
