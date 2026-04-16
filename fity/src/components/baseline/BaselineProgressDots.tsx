import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { colors } from '../../theme/colors';
import { DURATION } from '../../theme/motion';

interface Props {
  total: number;
  current: number; // 0-indexed
}

const Dot: React.FC<{ filled: boolean }> = ({ filled }) => {
  const s = useAnimatedStyle(() => ({
    width: withTiming(filled ? 22 : 8, { duration: DURATION.fast }),
    backgroundColor: withTiming(filled ? colors.LIME : colors.GRAY2, { duration: DURATION.fast }),
  }));
  return <Animated.View style={[styles.dot, s]} />;
};

export const BaselineProgressDots: React.FC<Props> = ({ total, current }) => (
  <View style={styles.row}>
    {Array.from({ length: total }).map((_, i) => (
      <Dot key={i} filled={i <= current} />
    ))}
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
});
