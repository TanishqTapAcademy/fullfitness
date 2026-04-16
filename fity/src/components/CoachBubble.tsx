import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { colors } from '../theme/colors';
import { CoachAvatarIcon } from './icons';

interface Props {
  text?: string;
  typing?: boolean;
}

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

export const CoachBubble: React.FC<Props> = ({ text, typing }) => {
  return (
    <Animated.View entering={FadeInUp.duration(260).easing(Easing.out(Easing.cubic))} style={styles.row}>
      <CoachAvatarIcon size={36} />
      <View style={styles.bubble}>
        {typing ? (
          <View style={styles.dots}>
            <Dot delay={0} />
            <Dot delay={150} />
            <Dot delay={300} />
          </View>
        ) : (
          <Text style={styles.text}>{text}</Text>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    marginBottom: 12,
    maxWidth: '88%',
  },
  bubble: {
    backgroundColor: colors.DARK3,
    padding: 14,
    borderRadius: 18,
    borderTopLeftRadius: 4,
    flexShrink: 1,
  },
  text: { color: colors.WHITE, fontSize: 15, lineHeight: 21 },
  dots: { flexDirection: 'row', gap: 4, paddingVertical: 4 },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.MUTED,
  },
});
