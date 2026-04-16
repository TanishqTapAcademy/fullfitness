import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { colors } from '../../theme/colors';
import { DURATION, STAGGER } from '../../theme/motion';
import { useViewportTrigger } from '../../hooks/useViewportTrigger';

interface Props {
  /** 84 values, 0 = rest, 1..3 intensity. */
  cells: number[];
  cols?: number;
}

const intensityColor = (v: number): string => {
  if (v === 0) return colors.DARK3;
  if (v === 1) return 'rgba(232,255,107,0.28)';
  if (v === 2) return 'rgba(232,255,107,0.55)';
  return colors.LIME;
};

/**
 * 12×7 activity grid. Cells stagger-fade in the first time the component
 * lands in the viewport, capped so the total animation stays ~1.2s.
 */
export const Heatmap: React.FC<Props> = ({ cells, cols = 12 }) => {
  const { triggered, onLayout } = useViewportTrigger();
  const total = cells.length;
  // Cap per-cell delay so 84 cells ≈ 1.2s total.
  const maxDelay = 1200;
  const step = Math.min(STAGGER.tight / 4, maxDelay / total);

  return (
    <View onLayout={onLayout} style={styles.wrap}>
      <Text style={styles.label}>Last 12 weeks</Text>
      <View style={[styles.grid, { width: cols * 14 + (cols - 1) * 4 }]}>
        {cells.map((v, i) => (
          <Animated.View
            key={i}
            entering={triggered ? FadeIn.duration(DURATION.base).delay(i * step) : undefined}
            style={[styles.cell, { backgroundColor: intensityColor(v) }]}
          />
        ))}
      </View>
      <View style={styles.legendRow}>
        <Text style={styles.legend}>Less</Text>
        <View style={[styles.cell, { backgroundColor: intensityColor(0) }]} />
        <View style={[styles.cell, { backgroundColor: intensityColor(1) }]} />
        <View style={[styles.cell, { backgroundColor: intensityColor(2) }]} />
        <View style={[styles.cell, { backgroundColor: intensityColor(3) }]} />
        <Text style={styles.legend}>More</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: 20,
    marginTop: 22,
    padding: 16,
    borderRadius: 20,
    backgroundColor: colors.DARK2,
    borderWidth: 1,
    borderColor: colors.GRAY,
  },
  label: {
    color: colors.MUTED,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    alignSelf: 'center',
  },
  cell: {
    width: 14,
    height: 14,
    borderRadius: 3,
  },
  legendRow: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'center',
  },
  legend: {
    color: colors.MUTED,
    fontSize: 11,
    fontWeight: '600',
  },
});
