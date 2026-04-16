import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { colors } from '../../theme/colors';
import { CheckIcon } from '../icons';
import { DURATION, SPRING_BOUNCE } from '../../theme/motion';

/**
 * Peak-end moment after the 4th baseline test. Big lime check + pulse ring
 * + "Baseline captured" text. Parent handles the auto-advance to Home.
 */
export const BaselineCelebration: React.FC = () => {
  const ringScale = useSharedValue(0.4);
  const ringOpacity = useSharedValue(0);
  const checkScale = useSharedValue(0);

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

    checkScale.value = withSpring(1, SPRING_BOUNCE);

    ringOpacity.value = withSequence(
      withTiming(0.6, { duration: 200 }),
      withRepeat(withTiming(0, { duration: 900 }), 2, false),
    );
    ringScale.value = withDelay(
      0,
      withRepeat(withTiming(1.6, { duration: 900 }), 2, false),
    );
  }, [checkScale, ringOpacity, ringScale]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
    opacity: ringOpacity.value,
  }));

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  return (
    <View style={styles.wrap}>
      <View style={styles.badgeWrap}>
        <Animated.View style={[styles.ring, ringStyle]} />
        <Animated.View style={[styles.badge, checkStyle]}>
          <CheckIcon size={54} color={colors.DARK} />
        </Animated.View>
      </View>
      <Animated.Text
        entering={FadeInDown.duration(DURATION.base).delay(160)}
        style={styles.title}
      >
        Baseline captured.
      </Animated.Text>
      <Animated.Text
        entering={FadeIn.duration(DURATION.base).delay(320)}
        style={styles.sub}
      >
        Your plan is tuned to how you move today.
      </Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 10,
  },
  badgeWrap: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  ring: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.LIME,
  },
  badge: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: colors.LIME,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: colors.WHITE,
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
  },
  sub: {
    color: colors.MUTED,
    fontSize: 15,
    textAlign: 'center',
    maxWidth: 280,
    marginTop: 4,
  },
});
