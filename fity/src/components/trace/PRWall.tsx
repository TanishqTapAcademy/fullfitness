import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors } from '../../theme/colors';
import { TrophyIcon } from '../icons';
import { useCountUp } from '../../hooks/useCountUp';
import { useViewportTrigger } from '../../hooks/useViewportTrigger';
import { DURATION, EASING_OUT_CUBIC, STAGGER } from '../../theme/motion';
import type { PR } from '../../data/progressFixtures';

interface Props {
  prs: PR[];
}

const PRItem: React.FC<{ pr: PR; index: number; enabled: boolean }> = ({ pr, index, enabled }) => {
  const value = useCountUp({
    to: pr.value,
    duration: DURATION.hero,
    delay: index * STAGGER.normal,
    enabled,
  });
  return (
    <Animated.View
      entering={FadeInDown.duration(DURATION.slow).delay(index * STAGGER.normal).easing(EASING_OUT_CUBIC)}
      style={styles.tile}
    >
      <View style={styles.tileTop}>
        <TrophyIcon size={16} color={colors.LIME} />
        <Text style={styles.tileLabel}>{pr.lift}</Text>
      </View>
      <View style={styles.numRow}>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.unit}>{pr.unit}</Text>
      </View>
    </Animated.View>
  );
};

/** 2×2 grid of PR tiles that count up when the wall scrolls into view. */
export const PRWall: React.FC<Props> = ({ prs }) => {
  const { triggered, onLayout } = useViewportTrigger();
  return (
    <View onLayout={onLayout} style={styles.wrap}>
      <Text style={styles.heading}>Personal records</Text>
      <View style={styles.grid}>
        {prs.map((pr, i) => (
          <PRItem key={pr.id} pr={pr} index={i} enabled={triggered} />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: 20,
    marginTop: 22,
  },
  heading: {
    color: colors.MUTED,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tile: {
    flexBasis: '48%',
    flexGrow: 1,
    backgroundColor: colors.DARK2,
    borderWidth: 1,
    borderColor: colors.GRAY,
    borderRadius: 18,
    padding: 16,
    minHeight: 100,
    justifyContent: 'space-between',
  },
  tileTop: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  tileLabel: {
    color: colors.MUTED,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  numRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 4 },
  value: { color: colors.WHITE, fontSize: 30, fontWeight: '800', lineHeight: 32 },
  unit: { color: colors.MUTED, fontSize: 13, fontWeight: '700', paddingBottom: 4 },
});
