import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { colors } from '../../theme/colors';
import { FlameIcon } from '../icons';
import { useCountUp } from '../../hooks/useCountUp';
import { DURATION, EASING_OUT_CUBIC, STAGGER } from '../../theme/motion';

interface Props {
  streak: number;
  delay?: number;
}

/**
 * Animated streak tile. Counts up from 0 → streak, pulses a lime ring on
 * mount, and fades in with a slight delay so the parent can stagger it.
 */
export const StreakCard: React.FC<Props> = ({ streak, delay = STAGGER.normal }) => {
  const value = useCountUp({ to: streak, duration: DURATION.slow, delay });

  const pulse = useSharedValue(0);
  useEffect(() => {
    pulse.value = withSequence(
      withTiming(1, { duration: DURATION.base }),
      withTiming(0, { duration: DURATION.hero }),
    );
  }, [pulse]);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulse.value * 0.55,
    transform: [{ scale: 1 + pulse.value * 0.25 }],
  }));

  return (
    <Animated.View
      entering={FadeInDown.duration(DURATION.slow).delay(delay).easing(EASING_OUT_CUBIC)}
      style={styles.card}
    >
      <View style={styles.topRow}>
        <Text style={styles.label}>Current streak</Text>
        <FlameIcon size={18} color={colors.LIME} />
      </View>
      <View style={styles.numRow}>
        <Animated.View style={[styles.pulseRing, pulseStyle]} />
        <Text style={styles.number}>{value}</Text>
        <Text style={styles.unit}>day{value === 1 ? '' : 's'}</Text>
      </View>
      <Text style={styles.hint}>Keep the fire lit — show up tomorrow.</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginTop: 8,
    borderRadius: 24,
    backgroundColor: colors.DARK2,
    borderWidth: 1,
    borderColor: colors.GRAY,
    padding: 20,
    overflow: 'hidden',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    color: colors.MUTED,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  numRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginTop: 8,
  },
  pulseRing: {
    position: 'absolute',
    left: -10,
    bottom: -10,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.LIME,
  },
  number: {
    color: colors.LIME,
    fontSize: 64,
    fontWeight: '800',
    lineHeight: 64,
    letterSpacing: -2,
  },
  unit: {
    color: colors.WHITE,
    fontSize: 16,
    fontWeight: '700',
    paddingBottom: 10,
  },
  hint: {
    color: colors.MUTED,
    fontSize: 13,
    marginTop: 10,
  },
});
