import { Component, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { children: ReactNode };
type State = { error: Error | null };

/** Last-resort UI for unrecoverable errors such as database initialisation failures. */
export class AppErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>
            InterestLoop could not start. Your saved data is safe — try again.
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => this.setState({ error: null })}
            style={styles.button}>
            <Text style={styles.buttonLabel}>Try again</Text>
          </Pressable>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F6FB',
    padding: 32,
  },
  title: { fontSize: 20, fontWeight: '800', color: '#171A33', marginBottom: 10 },
  message: { fontSize: 14, color: '#6A708C', textAlign: 'center', lineHeight: 20 },
  button: {
    marginTop: 20,
    backgroundColor: '#5B4FE9',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  buttonLabel: { color: '#FFFFFF', fontWeight: '700' },
});
