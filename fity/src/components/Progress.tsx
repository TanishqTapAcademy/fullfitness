import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { colors } from '../theme/colors';
import { ONBOARDING_STEPS } from '../data/onboarding';

interface Props {
  step: number; // 0-based
  total?: number;
}

const Segment: React.FC<{ active: boolean; filled: boolean }> = ({ active, filled }) => {
  const progress = useSharedValue(filled ? 1 : 0);

  useEffect(() => {
    if (filled) {
      progress.value = withTiming(1, { duration: 0 });
    } else if (active) {
      progress.value = 0;
      progress.value = withTiming(1, { duration: 420, easing: Easing.out(Easing.cubic) });
    } else {
      progress.value = withTiming(0, { duration: 200 });
    }
  }, [filled, active, progress]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  return (
    <View style={styles.segment}>
      <Animated.View style={[styles.fill, fillStyle]} />
    </View>
  );
};

export const Progress: React.FC<Props> = ({ step, total = ONBOARDING_STEPS }) => {
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        {Array.from({ length: total }).map((_, i) => (
          <Segment key={i} active={i === step} filled={i < step} />
        ))}
      </View>
      <Text style={styles.label}>Step {Math.min(step + 1, total)} of {total}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    gap: 6,
    flex: 1,
  },
  segment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.GRAY,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.LIME,
  },
  label: {
    color: colors.MUTED,
    fontSize: 11,
    fontWeight: '600',
  },
});
