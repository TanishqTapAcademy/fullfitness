import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors } from '../../theme/colors';
import { FlameIcon } from '../icons';
import { useCountUp } from '../../hooks/useCountUp';
import { DURATION, EASING_OUT_CUBIC } from '../../theme/motion';

interface Props {
  streak: number;
  bestStreak: number;
}

/**
 * Big lime hero card at the top of Trace. Counts up from 0 → streak to
 * make "the fact of your consistency" feel earned.
 */
export const StreakHero: React.FC<Props> = ({ streak, bestStreak }) => {
  const value = useCountUp({ to: streak, duration: DURATION.hero, delay: 120 });

  return (
    <Animated.View
      entering={FadeInDown.duration(DURATION.slow).easing(EASING_OUT_CUBIC)}
      style={styles.card}
    >
      <View style={styles.topRow}>
        <Text style={styles.label}>Streak</Text>
        <FlameIcon size={18} color={colors.DARK} />
      </View>
      <View style={styles.numRow}>
        <Text style={styles.number}>{value}</Text>
        <Text style={styles.unit}>day{value === 1 ? '' : 's'}</Text>
      </View>
      <Text style={styles.best}>Best: {bestStreak} day{bestStreak === 1 ? '' : 's'}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginTop: 8,
    borderRadius: 24,
    backgroundColor: colors.LIME,
    padding: 22,
    overflow: 'hidden',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    color: colors.DARK,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  numRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    marginTop: 6,
  },
  number: {
    color: colors.DARK,
    fontSize: 88,
    fontWeight: '900',
    lineHeight: 88,
    letterSpacing: -3,
  },
  unit: {
    color: colors.DARK,
    fontSize: 18,
    fontWeight: '800',
    paddingBottom: 14,
  },
  best: {
    color: colors.DARK,
    opacity: 0.6,
    fontSize: 13,
    marginTop: 8,
    fontWeight: '700',
  },
});
