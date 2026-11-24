import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { PanResponder, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Line } from 'react-native-svg';

import { Card, EmptyState, ErrorState, LoadingState, Screen, ScreenContent, ScreenHeader, SectionHeader } from '@/components/ui';
import { getInterest } from '@/lib/interest-catalogue';
import { useInterestActivity, useInterests } from '@/hooks/use-app-data';
import { buildGraph } from '@/lib/graph';
import { radius, space, useTheme } from '@/theme/tokens';
import type { GraphNode } from '@/types/models';

const CANVAS = 360;
const NODE_SIZE = 58;

export default function GraphScreen() {
  const theme = useTheme();
  const interests = useInterests();
  const activity = useInterestActivity();
  const [selected, setSelected] = useState<GraphNode | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);

  // moveX - x0 is the total translation since the gesture started, so panning
  // stays correct without reading refs or stale state during render.
  const pan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderMove: (_, gesture) => {
          setOffset({ x: gesture.moveX - gesture.x0, y: gesture.moveY - gesture.y0 });
        },
      }),
    [],
  );

  const { nodes, edges } = useMemo(
    () => buildGraph(interests.data ?? [], activity.data ?? {}),
    [interests.data, activity.data],
  );

  const nodeById = useMemo(
    () => new Map(nodes.map((node) => [node.id, node])),
    [nodes],
  );

  if (interests.isLoading || activity.isLoading) {
    return <Screen><LoadingState label="Mapping your interests…" /></Screen>;
  }

  if (interests.isError || activity.isError) {
    return (
      <Screen>
        <ErrorState
          message="Could not load your graph."
          onRetry={() => {
            interests.refetch();
            activity.refetch();
          }}
        />
      </Screen>
    );
  }

  if (nodes.length === 0) {
    return (
      <Screen>
        <ScreenContent>
          <ScreenHeader title="Knowledge Graph" subtitle="See how your interests connect." />
          <EmptyState
            icon="git-network-outline"
            title="No interests yet"
            message="Choose a few interests in your profile to grow your graph."
            actionLabel="Open profile"
            onAction={() => router.push('/profile')}
          />
        </ScreenContent>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView>
        <ScreenContent>
          <ScreenHeader
            title="Knowledge Graph"
            subtitle="Drag to pan. Tap a node to explore a topic."
          />

          <View
            style={[
              styles.canvas,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
            {...pan.panHandlers}>
            <Svg width={CANVAS} height={CANVAS} style={StyleSheet.absoluteFill} pointerEvents="none">
              {edges.map((edge) => {
                const from = nodeById.get(edge.from);
                const to = nodeById.get(edge.to);
                if (!from || !to) return null;
                return (
                  <Line
                    key={edge.id}
                    x1={from.x * scale + offset.x + NODE_SIZE / 2}
                    y1={from.y * scale + offset.y + NODE_SIZE / 2}
                    x2={to.x * scale + offset.x + NODE_SIZE / 2}
                    y2={to.y * scale + offset.y + NODE_SIZE / 2}
                    stroke={theme.border}
                    strokeWidth={2 + edge.strength}
                  />
                );
              })}
            </Svg>

            {nodes.map((node) => (
              <Pressable
                key={node.id}
                onPress={() => setSelected(node)}
                accessibilityRole="button"
                accessibilityLabel={`${node.label}, ${node.savedCount} saved items`}
                style={[
                  styles.node,
                  {
                    backgroundColor: node.color,
                    left: node.x * scale + offset.x,
                    top: node.y * scale + offset.y,
                    borderColor: theme.surface,
                  },
                  selected?.id === node.id && styles.selectedNode,
                ]}>
                <Text style={styles.nodeLabel} numberOfLines={2}>
                  {node.label}
                </Text>
              </Pressable>
            ))}

            <View style={styles.zoomControls}>
              <Pressable
                accessibilityLabel="Zoom in"
                onPress={() => setScale((value) => Math.min(1.8, +(value + 0.2).toFixed(2)))}
                style={[styles.zoomButton, { backgroundColor: theme.surfaceAlt }]}>
                <Ionicons name="add" size={18} color={theme.text} />
              </Pressable>
              <Pressable
                accessibilityLabel="Zoom out"
                onPress={() => setScale((value) => Math.max(0.6, +(value - 0.2).toFixed(2)))}
                style={[styles.zoomButton, { backgroundColor: theme.surfaceAlt }]}>
                <Ionicons name="remove" size={18} color={theme.text} />
              </Pressable>
              <Pressable
                accessibilityLabel="Reset graph view"
                onPress={() => {
                  setOffset({ x: 0, y: 0 });
                  setScale(1);
                }}
                style={[styles.zoomButton, { backgroundColor: theme.surfaceAlt }]}>
                <Ionicons name="refresh-outline" size={16} color={theme.text} />
              </Pressable>
            </View>
          </View>

          <SectionHeader title="Topic details" />
          {selected ? (
            <Card>
              <View style={styles.detailHeader}>
                <View style={[styles.detailDot, { backgroundColor: selected.color }]} />
                <Text style={[styles.detailTitle, { color: theme.text }]}>
                  {getInterest(selected.interest).label}
                </Text>
              </View>
              <Text style={[styles.detailText, { color: theme.textMuted }]}>
                {getInterest(selected.interest).blurb.trim()} You have saved{' '}
                {selected.savedCount} {selected.savedCount === 1 ? 'item' : 'items'} in this topic.
              </Text>
              <Text style={[styles.detailLabel, { color: theme.text }]}>Connected topics</Text>
              <View style={styles.related}>
                {Array.from(
                  new Set(
                    edges
                      .filter((edge) => edge.from === selected.id || edge.to === selected.id)
                      .map((edge) => (edge.from === selected.id ? edge.to : edge.from)),
                  ),
                ).map((id) => (
                  <View key={id} style={[styles.relatedPill, { backgroundColor: theme.surfaceAlt }]}>
                    <Text style={{ color: theme.text, fontSize: 12, fontWeight: '600' }}>
                      {getInterest(id).short}
                    </Text>
                  </View>
                ))}
                {edges.every(
                  (edge) => edge.from !== selected.id && edge.to !== selected.id,
                ) ? (
                  <Text style={{ color: theme.textMuted, fontSize: 12 }}>
                    Save a few items to link this topic to others.
                  </Text>
                ) : null}
              </View>
            </Card>
          ) : (
            <Card>
              <Text style={[styles.detailText, { color: theme.textMuted }]}>
                Tap any node to see how it connects to the things you read and watch.
              </Text>
            </Card>
          )}

          <Text style={[styles.tip, { color: theme.textMuted }]}>
            Nodes grow in meaning as you save articles, movies and discoveries.
          </Text>
        </ScreenContent>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  canvas: {
    width: CANVAS,
    height: CANVAS,
    alignSelf: 'center',
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: space.xl,
  },
  node: {
    position: 'absolute',
    width: NODE_SIZE,
    height: NODE_SIZE,
    borderRadius: NODE_SIZE / 2,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  selectedNode: { borderWidth: 4 },
  nodeLabel: { color: '#fff', fontSize: 11, fontWeight: '800', textAlign: 'center' },
  zoomControls: { position: 'absolute', right: 10, bottom: 10, gap: 6 },
  zoomButton: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  detailHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  detailDot: { width: 12, height: 12, borderRadius: 6 },
  detailTitle: { fontSize: 16, fontWeight: '700' },
  detailText: { fontSize: 13, lineHeight: 19, marginTop: 8 },
  detailLabel: { fontSize: 13, fontWeight: '700', marginTop: 14, marginBottom: 8 },
  related: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  relatedPill: { borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 6 },
  tip: { fontSize: 12, textAlign: 'center', marginTop: space.lg, lineHeight: 18 },
});
