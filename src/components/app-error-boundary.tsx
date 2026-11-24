import { Component, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme/tokens';

type Props = { children: ReactNode };
type State = { error: Error | null };

function ErrorFallback({ onRetry }: { onRetry: () => void }) {
  const theme = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Something went wrong</Text>
      <Text style={[styles.message, { color: theme.textMuted }]}>
        InterestLoop could not start. Your saved data is safe — try again.
      </Text>
      <Pressable
        accessibilityRole="button"
        onPress={onRetry}
        style={[styles.button, { backgroundColor: theme.primary }]}>
        <Text style={[styles.buttonLabel, { color: theme.onPrimary }]}>Try again</Text>
      </Pressable>
    </View>
  );
}

/** Last-resort UI for unrecoverable errors such as database initialisation failures. */
export class AppErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (this.state.error) {
      return <ErrorFallback onRetry={() => this.setState({ error: null })} />;
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  title: { fontSize: 20, fontWeight: '800', marginBottom: 10 },
  message: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  button: {
    marginTop: 20,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  buttonLabel: { fontWeight: '700' },
});
