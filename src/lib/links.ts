import { openBrowserAsync } from 'expo-web-browser';
import { Platform } from 'react-native';

/** Open a link in the platform browser, falling back gracefully on web. */
export async function openExternalUrl(url: string): Promise<void> {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
    return;
  }

  try {
    await openBrowserAsync(url);
  } catch {
    // User cancelled the in-app browser or no browser is available.
  }
}
