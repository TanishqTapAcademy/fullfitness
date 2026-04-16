import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { colors } from '../../theme/colors';

const Dot: React.FC<{ delay: number }> = ({ delay }) => {
  const o = useSharedValue(0.3);
  useEffect(() => {
    o.value = withDelay(
      delay,
      withRepeat(withTiming(1, { duration: 450 }), -1, true),
    );
  }, [delay, o]);
  const s = useAnimatedStyle(() => ({ opacity: o.value }));
  return <Animated.View style={[styles.dot, s]} />;
};

/**
 * Three pulsing dots used while the coach is "thinking".
 * Extracted from the original CoachBubble so it can be reused in both the
 * onboarding chat (via CoachBubble) and the fullscreen Chat screen.
 */
export const TypingIndicator: React.FC = () => (
  <View style={styles.dots}>
    <Dot delay={0} />
    <Dot delay={150} />
    <Dot delay={300} />
  </View>
);

const styles = StyleSheet.create({
  dots: { flexDirection: 'row', gap: 4, paddingVertical: 4 },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.MUTED,
  },
});
