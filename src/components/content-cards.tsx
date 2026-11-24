import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { INTEREST_BY_ID } from '@/constants/interests';
import { formatCount, formatDate, formatRating, initials, truncate } from '@/lib/format';
import { openExternalUrl } from '@/lib/links';
import { radius, space, useTheme } from '@/theme/tokens';
import type { DiscoveryItem, Movie, NewsArticle } from '@/types/models';

import { Card, SaveButton } from './ui';

export function NewsCard({
  article,
  saved,
  saving,
  onToggleSave,
  compact = false,
}: {
  article: NewsArticle;
  saved: boolean;
  saving: boolean;
  onToggleSave: () => void;
  compact?: boolean;
}) {
  const theme = useTheme();
  const interest = INTEREST_BY_ID[article.interest];

  return (
    <Card>
      <View style={styles.row}>
        {article.imageUrl ? (
          <Image
            source={{ uri: article.imageUrl }}
            style={[styles.thumb, compact && styles.thumbSmall]}
            contentFit="cover"
            cachePolicy="memory-disk"
          />
        ) : (
          <View
            style={[
              styles.thumb,
              compact && styles.thumbSmall,
              styles.thumbFallback,
              { backgroundColor: theme.primarySoft },
            ]}>
            <Ionicons name="newspaper-outline" size={22} color={interest.color} />
          </View>
        )}
        <View style={styles.flex}>
          <Text style={[styles.meta, { color: interest.color }]}>{interest.short}</Text>
          <Text style={[styles.title, { color: theme.text }]} numberOfLines={compact ? 2 : 3}>
            {article.title}
          </Text>
          <Text style={[styles.meta, { color: theme.textMuted }]}>
            {article.source} · {formatDate(article.publishedAt)}
          </Text>
        </View>
        <SaveButton saved={saved} busy={saving} onPress={onToggleSave} />
      </View>

      {!compact && article.description ? (
        <Text style={[styles.description, { color: theme.textMuted }]} numberOfLines={3}>
          {article.description}
        </Text>
      ) : null}

      <Text
        accessibilityRole="link"
        onPress={() =>
          router.push({
            pathname: '/article/[url]',
            params: { url: article.url, data: JSON.stringify(article) },
          })
        }
        style={[styles.link, { color: theme.primary }]}>
        Read in app
      </Text>
      <Text
        accessibilityRole="link"
        onPress={() => openExternalUrl(article.url)}
        style={[styles.secondaryLink, { color: theme.textMuted }]}>
        Publisher site ↗
      </Text>
    </Card>
  );
}

export function MovieCard({
  movie,
  saved,
  saving,
  onToggleSave,
  rank,
  compact = false,
}: {
  movie: Movie;
  saved: boolean;
  saving: boolean;
  onToggleSave: () => void;
  rank?: number;
  compact?: boolean;
}) {
  const theme = useTheme();
  const interest = INTEREST_BY_ID[movie.interest];
  const posterSource = movie.posterPath
    ? { uri: `https://image.tmdb.org/t/p/w342${movie.posterPath}` }
    : null;

  return (
    <Card>
      <View style={styles.row}>
        {posterSource ? (
          <Image
            source={posterSource}
            style={[styles.poster, compact && styles.posterSmall]}
            contentFit="cover"
          />
        ) : (
          <View
            style={[
              styles.poster,
              compact && styles.posterSmall,
              styles.posterFallback,
              { backgroundColor: theme.primarySoft },
            ]}>
            <Text style={[styles.posterInitials, { color: interest.color }]}>
              {initials(movie.title)}
            </Text>
          </View>
        )}

        <View style={styles.flex}>
          <View style={styles.rankRow}>
            {rank ? (
              <View
                style={[
                  styles.rankBadge,
                  { backgroundColor: rank <= 3 ? theme.primary : theme.primarySoft },
                ]}>
                <Text
                  style={[
                    styles.rankText,
                    { color: rank <= 3 ? theme.onPrimary : theme.primary },
                  ]}>
                  #{rank}
                </Text>
              </View>
            ) : null}
            <Text style={[styles.meta, { color: interest.color }]}>{interest.short}</Text>
          </View>
          <Text style={[styles.title, { color: theme.text }]} numberOfLines={2}>
            {movie.title}
          </Text>
          <Text style={[styles.meta, { color: theme.textMuted }]}>
            ⭐ {formatRating(movie.rating)} · {formatCount(movie.voteCount)} votes ·{' '}
            {movie.releaseDate.slice(0, 4) || '—'}
          </Text>
          {!compact ? (
            <Text style={[styles.description, { color: theme.textMuted }]} numberOfLines={3}>
              {movie.overview || 'No synopsis available.'}
            </Text>
          ) : null}
          <Text
            accessibilityRole="link"
            onPress={() => router.push(`/movie/${movie.id}`)}
            style={[styles.trailer, { color: theme.primary }]}>
            Watch trailer & details →
          </Text>
        </View>

        <SaveButton saved={saved} busy={saving} onPress={onToggleSave} />
      </View>
    </Card>
  );
}

export function DiscoveryCard({
  item,
  saved,
  saving,
  onToggleSave,
}: {
  item: DiscoveryItem;
  saved: boolean;
  saving: boolean;
  onToggleSave: () => void;
}) {
  const theme = useTheme();
  const sourceLabel =
    item.source === 'hacker-news' ? 'Hacker News' : item.source === 'reddit' ? 'Reddit' : 'Curated';

  return (
    <Card>
      <View style={styles.row}>
        <View style={styles.flex}>
          <View style={styles.badgeRow}>
            <View style={[styles.badge, { backgroundColor: theme.primarySoft }]}>
              <Text style={[styles.badgeText, { color: theme.primary }]}>{sourceLabel}</Text>
            </View>
            <Text style={[styles.meta, { color: theme.textMuted }]}>
              {item.age} · ▲ {item.score}
            </Text>
          </View>
          <Text style={[styles.title, { color: theme.text }]} numberOfLines={3}>
            {item.title}
          </Text>
          <Text style={[styles.description, { color: theme.textMuted }]} numberOfLines={2}>
            {item.excerpt}
          </Text>
          <Text
            accessibilityRole="link"
            onPress={() => openExternalUrl(item.url)}
            style={[styles.link, { color: theme.primary }]}>
            Open discussion
          </Text>
        </View>
        <SaveButton saved={saved} busy={saving} onPress={onToggleSave} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: space.md },
  flex: { flex: 1 },
  title: { fontSize: 16, fontWeight: '700', lineHeight: 22, marginVertical: 5 },
  meta: { fontSize: 12, fontWeight: '600' },
  description: { fontSize: 13, lineHeight: 19, marginTop: 6 },
  trailer: { fontSize: 12, fontWeight: '700', marginTop: 8 },
  link: { fontSize: 13, fontWeight: '700', marginTop: 10 },
  secondaryLink: { fontSize: 12, fontWeight: '600', marginTop: 6 },
  thumb: { width: 76, height: 76, borderRadius: radius.sm },
  thumbSmall: { width: 60, height: 60 },
  thumbFallback: { alignItems: 'center', justifyContent: 'center' },
  rankRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rankBadge: { borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 3 },
  rankText: { fontSize: 11, fontWeight: '800' },
  poster: { width: 76, height: 112, borderRadius: radius.sm },
  posterSmall: { width: 56, height: 84 },
  posterFallback: { alignItems: 'center', justifyContent: 'center' },
  posterInitials: { fontSize: 22, fontWeight: '800' },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  badge: { borderRadius: radius.pill, paddingHorizontal: 9, paddingVertical: 4 },
  badgeText: { fontSize: 11, fontWeight: '700' },
});

export function SavedRowCard({
  title,
  subtitle,
  icon,
  onPress,
}: {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <Card onPress={onPress} accessibilityLabel={title}>
      <View style={styles.row}>
        <Ionicons name={icon} size={22} color={theme.primary} />
        <View style={styles.flex}>
          <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
          <Text style={[styles.meta, { color: theme.textMuted }]}>{truncate(subtitle, 70)}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
      </View>
    </Card>
  );
}
