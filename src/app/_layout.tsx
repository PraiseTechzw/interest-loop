import { Stack } from 'expo-router/stack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { SQLiteProvider } from 'expo-sqlite';
import { Suspense, useState } from 'react';
import { ActivityIndicator, useColorScheme, View } from 'react-native';

import { AppErrorBoundary } from '@/components/app-error-boundary';
import { DATABASE_NAME, migrateDatabase } from '@/lib/database';

function BootFallback() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0E1020' }}>
      <ActivityIndicator color="#9A8EFF" />
    </View>
  );
}

export default function RootLayout() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );
  const colorScheme = useColorScheme();

  return (
    <QueryClientProvider client={queryClient}>
      <AppErrorBoundary>
        <Suspense fallback={<BootFallback />}>
          <SQLiteProvider
            databaseName={DATABASE_NAME}
            onInit={migrateDatabase}
            useSuspense>
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
            <Stack
              screenOptions={{
                contentStyle: {
                  backgroundColor: colorScheme === 'dark' ? '#0E1020' : '#F5F6FB',
                },
              }}>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="coach" options={{ title: 'Mindset Coach' }} />
              <Stack.Screen name="graph" options={{ title: 'Knowledge Graph' }} />
              <Stack.Screen name="saved" options={{ title: 'Saved for later' }} />
              <Stack.Screen name="learning" options={{ title: 'Learning Paths' }} />
              <Stack.Screen name="capsule" options={{ title: 'Time Capsule' }} />
              <Stack.Screen name="settings" options={{ title: 'Settings' }} />
              <Stack.Screen name="credits" options={{ title: 'Credits' }} />
              <Stack.Screen name="privacy" options={{ title: 'Privacy' }} />
            </Stack>
          </SQLiteProvider>
        </Suspense>
      </AppErrorBoundary>
    </QueryClientProvider>
  );
}
