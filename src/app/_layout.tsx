import { Stack } from 'expo-router/stack';
import { onlineManager, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { SQLiteProvider } from 'expo-sqlite';
import { Suspense, useState } from 'react';
import { ActivityIndicator, useColorScheme, View } from 'react-native';

import { AppErrorBoundary } from '@/components/app-error-boundary';
import { ConnectivityProvider } from '@/components/connectivity-provider';
import { useInterestCatalogue } from '@/hooks/use-app-data';
import { DATABASE_NAME, migrateDatabase } from '@/lib/database';
import { useTheme } from '@/theme/tokens';

function BootFallback() {
  const theme = useTheme();
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.background,
      }}>
      <ActivityIndicator color={theme.primary} />
    </View>
  );
}

/** Seeds the shared interest registry so pure feed adapters know custom topics. */
function CatalogueBoot() {
  useInterestCatalogue();
  return null;
}

export default function RootLayout() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,
            networkMode: 'offlineFirst',
            retry: (failureCount) => (onlineManager.isOnline() ? failureCount < 1 : false),
            refetchOnWindowFocus: false,
            refetchOnReconnect: true,
          },
        },
      }),
  );
  const colorScheme = useColorScheme();
  const theme = useTheme();

  return (
    <ConnectivityProvider>
      <QueryClientProvider client={queryClient}>
        <AppErrorBoundary>
        <Suspense fallback={<BootFallback />}>
          <SQLiteProvider
            databaseName={DATABASE_NAME}
            onInit={migrateDatabase}
            useSuspense>
            <CatalogueBoot />
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
            <Stack
              screenOptions={{
                contentStyle: { backgroundColor: theme.background },
                headerStyle: { backgroundColor: theme.surface },
                headerTintColor: theme.text,
                headerTitleStyle: { color: theme.text, fontWeight: '700' },
              }}>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="coach" options={{ title: 'Mindset Coach' }} />
              <Stack.Screen name="graph" options={{ title: 'Knowledge Graph' }} />
              <Stack.Screen name="saved" options={{ title: 'Saved for later' }} />
              <Stack.Screen name="learning" options={{ title: 'Learning Paths' }} />
              <Stack.Screen name="capsule" options={{ title: 'Time Capsule' }} />
              <Stack.Screen name="profile-edit" options={{ title: 'Edit profile' }} />
              <Stack.Screen name="interests" options={{ title: 'My topics' }} />
              <Stack.Screen name="capture" options={{ title: 'Capture a thought' }} />
              <Stack.Screen name="settings" options={{ title: 'Settings' }} />
              <Stack.Screen name="credits" options={{ title: 'Credits' }} />
              <Stack.Screen name="privacy" options={{ title: 'Privacy' }} />
              <Stack.Screen name="onboarding" options={{ headerShown: false }} />
              <Stack.Screen name="search" options={{ title: 'Search' }} />
              <Stack.Screen name="feedback" options={{ title: 'Feedback' }} />
              <Stack.Screen name="diagnostics" options={{ title: 'Diagnostics' }} />
              <Stack.Screen name="terms" options={{ title: 'Terms of use' }} />
              <Stack.Screen name="export" options={{ title: 'Backup & restore' }} />
              <Stack.Screen name="accessibility" options={{ title: 'Accessibility' }} />
              <Stack.Screen name="article/[url]" options={{ title: 'Article' }} />
              <Stack.Screen name="movie/[id]" options={{ title: 'Movie' }} />
            </Stack>
          </SQLiteProvider>
        </Suspense>
        </AppErrorBoundary>
      </QueryClientProvider>
    </ConnectivityProvider>
  );
}
