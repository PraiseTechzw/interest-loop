import Ionicons from '@expo/vector-icons/Ionicons';
import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { radius, space, useTheme } from '@/theme/tokens';

import { useConnectivity } from './connectivity-provider';

export type SafeAreaEdge = 'top' | 'bottom';

/** Shown at the top of every screen when the device has no connection. */
export function OfflineBanner() {
  const { isOffline } = useConnectivity();
  const theme = useTheme();
  if (!isOffline) return null;
  return (
    <View
      accessibilityRole="alert"
      style={[styles.offlineBanner, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}>
      <Ionicons name="cloud-offline-outline" size={14} color={theme.textMuted} />
      <Text style={[styles.offlineText, { color: theme.textMuted }]}>
        Offline — showing what’s saved on this device
      </Text>
    </View>
  );
}

/**
 * Root container for a route. Screens with a native Stack header already get
 * the top inset from the header; headerless screens (tabs, onboarding) must
 * opt in with `edges` so their content clears the status bar / system bars.
 */
export function Screen({
  children,
  edges = [],
}: {
  children: ReactNode;
  edges?: SafeAreaEdge[];
}) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.screen,
        {
          backgroundColor: theme.background,
          paddingTop: edges.includes('top') ? insets.top : 0,
          paddingBottom: edges.includes('bottom') ? insets.bottom : 0,
        },
      ]}>
      <OfflineBanner />
      {children}
    </View>
  );
}

export function ScreenContent({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.content, style]}>{children}</View>;
}

export function ScreenHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  const theme = useTheme();
  return (
    <View style={styles.headerRow}>
      <View style={styles.headerText}>
        <Text accessibilityRole="header" style={[styles.headerTitle, { color: theme.text }]}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={[styles.headerSubtitle, { color: theme.textMuted }]}>{subtitle}</Text>
        ) : null}
      </View>
      {action}
    </View>
  );
}

export function SectionHeader({
  title,
  actionLabel,
  onAction,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const theme = useTheme();
  return (
    <View style={styles.sectionHeader}>
      <Text accessibilityRole="header" style={[styles.sectionTitle, { color: theme.text }]}>
        {title}
      </Text>
      {actionLabel && onAction ? (
        <Pressable onPress={onAction} hitSlop={8} accessibilityRole="button">
          <Text style={{ color: theme.primary, fontWeight: '600', fontSize: 13 }}>
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function Card({
  children,
  style,
  onPress,
  accessibilityLabel,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  accessibilityLabel?: string;
}) {
  const theme = useTheme();
  const cardStyle = [
    styles.card,
    {
      backgroundColor: theme.surface,
      borderColor: theme.border,
    },
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        style={({ pressed }) => [cardStyle, pressed && styles.pressed]}>
        {children}
      </Pressable>
    );
  }

  return <View style={cardStyle}>{children}</View>;
}

export function Pill({
  label,
  color,
  selected = false,
  onPress,
  icon,
  role = 'radio',
  busy = false,
}: {
  label: string;
  color?: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  role?: 'radio' | 'checkbox';
  busy?: boolean;
}) {
  const theme = useTheme();
  const tint = color ?? theme.primary;
  // onPrimary is tuned for theme.primary; arbitrary interest tints need a
  // luminance-aware foreground so selected chips stay legible in both themes.
  const onTint = isLightColor(tint) ? '#171A33' : '#FFFFFF';
  const content = (
    <View
      style={[
        styles.pill,
        {
          backgroundColor: selected ? tint : theme.surface,
          borderColor: selected ? tint : theme.border,
        },
      ]}>
      {icon ? (
        <Ionicons
          name={icon}
          size={14}
          color={selected ? onTint : theme.textMuted}
          style={styles.pillIcon}
        />
      ) : null}
      <Text style={[styles.pillText, { color: selected ? onTint : theme.text }]}>{label}</Text>
    </View>
  );

  if (!onPress) return content;

  return (
    <Pressable
      onPress={onPress}
      disabled={busy}
      accessibilityRole={role}
      accessibilityState={{ checked: selected, busy, disabled: busy }}
      accessibilityLabel={label}
      hitSlop={8}>
      {content}
    </Pressable>
  );
}

function isLightColor(hex: string): boolean {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return false;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 150;
}

export function SaveButton({
  saved,
  onPress,
  busy = false,
}: {
  saved: boolean;
  onPress: () => void;
  busy?: boolean;
}) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={busy}
      accessibilityRole="button"
      accessibilityLabel={saved ? 'Remove from saved' : 'Save on this device'}
      accessibilityState={{ disabled: busy, selected: saved }}
      hitSlop={8}
      style={({ pressed }) => [
        styles.saveButton,
        {
          backgroundColor: saved ? theme.primarySoft : theme.surface,
          borderColor: saved ? theme.primary : theme.border,
        },
        pressed && styles.pressed,
      ]}>
      <Ionicons
        name={saved ? 'bookmark' : 'bookmark-outline'}
        size={18}
        color={saved ? theme.primary : theme.textMuted}
      />
    </Pressable>
  );
}

export function NoticeBanner({
  message,
  tone = 'info',
}: {
  message: string;
  tone?: 'info' | 'warning' | 'error';
}) {
  const theme = useTheme();
  const accent =
    tone === 'error' ? theme.danger : tone === 'warning' ? theme.accent : theme.primary;
  return (
    <View
      accessibilityRole="alert"
      style={[styles.banner, { backgroundColor: theme.primarySoft, borderColor: theme.border }]}>
      <Ionicons
        name={tone === 'info' ? 'information-circle-outline' : 'warning-outline'}
        size={16}
        color={accent}
      />
      <Text style={[styles.bannerText, { color: theme.text }]}>{message}</Text>
    </View>
  );
}

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  const theme = useTheme();
  return (
    <View style={styles.state} accessibilityRole="progressbar" accessibilityLabel={label}>
      <ActivityIndicator size="large" color={theme.primary} />
      <Text style={[styles.stateText, { color: theme.textMuted }]}>{label}</Text>
    </View>
  );
}

/** Feed-level fallback when the network is unavailable. */
export function OfflineEmptyState({ onViewSaved }: { onViewSaved: () => void }) {
  return (
    <EmptyState
      icon="cloud-offline-outline"
      title="You’re offline"
      message="Live feeds need a connection. Anything you saved is still available on this device."
      actionLabel="View saved items"
      onAction={onViewSaved}
    />
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  const theme = useTheme();
  return (
    <View style={styles.state} accessibilityRole="alert">
      <Ionicons name="alert-circle-outline" size={32} color={theme.danger} />
      <Text style={[styles.stateText, { color: theme.text }]}>{message}</Text>
      <Pressable
        onPress={onRetry}
        accessibilityRole="button"
        style={[styles.retryButton, { backgroundColor: theme.primary }]}>
        <Text style={{ color: theme.onPrimary, fontWeight: '600' }}>Try again</Text>
      </Pressable>
    </View>
  );
}

export function EmptyState({
  icon = 'sparkles-outline',
  title,
  message,
  actionLabel,
  onAction,
}: {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const theme = useTheme();
  return (
    <View style={styles.state}>
      <View style={[styles.emptyIcon, { backgroundColor: theme.primarySoft }]}>
        <Ionicons name={icon} size={26} color={theme.primary} />
      </View>
      <Text style={[styles.emptyTitle, { color: theme.text }]}>{title}</Text>
      <Text style={[styles.stateText, { color: theme.textMuted, textAlign: 'center' }]}>
        {message}
      </Text>
      {actionLabel && onAction ? (
        <Pressable
          onPress={onAction}
          accessibilityRole="button"
          style={[styles.retryButton, { backgroundColor: theme.primary }]}>
          <Text style={{ color: theme.onPrimary, fontWeight: '600' }}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderBottomWidth: 1,
    paddingHorizontal: space.lg,
    paddingVertical: 8,
  },
  offlineText: { fontSize: 12, fontWeight: '600' },
  content: { paddingHorizontal: space.lg, paddingTop: space.md, paddingBottom: space.xxl },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: space.lg,
  },
  headerText: { flex: 1, marginRight: space.md },
  headerTitle: { fontSize: 28, fontWeight: '800', letterSpacing: -0.6 },
  headerSubtitle: { fontSize: 13, marginTop: 4, lineHeight: 18 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: space.lg,
    marginBottom: space.sm,
  },
  sectionTitle: { fontSize: 17, fontWeight: '700', letterSpacing: -0.3 },
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: space.lg,
    marginBottom: space.md,
  },
  pressed: { opacity: 0.75 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
    minHeight: 38,
  },
  pillIcon: { marginRight: 6 },
  pillText: { fontSize: 13, fontWeight: '600' },
  saveButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: 12,
    marginBottom: space.lg,
  },
  bannerText: { flex: 1, fontSize: 12, lineHeight: 17 },
  state: { alignItems: 'center', justifyContent: 'center', paddingVertical: 56, gap: 10 },
  stateText: { fontSize: 14, lineHeight: 20, maxWidth: 280 },
  retryButton: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: radius.md, marginTop: 6 },
  emptyIcon: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontSize: 16, fontWeight: '700' },
});
