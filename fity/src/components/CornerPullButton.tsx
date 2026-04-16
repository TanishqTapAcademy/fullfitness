import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  type SharedValue,
} from 'react-native-reanimated';
import { colors } from '../theme/colors';
import { PullIcon } from './icons';
import { useCornerDrag } from '../hooks/useCornerDrag';

interface Props {
  /** Fired when the user releases past the threshold OR taps the button. */
  onOpen: () => void;
  /** Accessibility label — differs per destination (e.g. "Open Chat", "Open Trace"). */
  accessibilityLabel: string;
  /**
   * Optional shared progress sink — the host screen can use this to scale /
   * round its underlying layer in reaction to the pull.
   */
  progressSink?: SharedValue<number>;
}

/**
 * Lime corner-anchored button with a drag-to-peel gesture. Tap → onOpen.
 * Drag up-left → lime glow blooms from the corner; releasing past 45%
 * threshold → onOpen; earlier → snaps back.
 *
 * Shared primitive so every "peel to next layer" transition in the app
 * looks and feels identical (Home → Chat, Chat → Trace).
 */
export const CornerPullButton: React.FC<Props> = ({
  onOpen,
  accessibilityLabel,
  progressSink,
}) => {
  const { gesture, progress } = useCornerDrag({
    onOpen,
    onPullStart: () => {
      Haptics.selectionAsync().catch(() => {});
    },
  });

  // Mirror progress into the optional sink for external reactions.
  useDerivedValue(() => {
    if (progressSink) progressSink.value = progress.value;
  });

  const btnStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: interpolate(progress.value, [0, 1], [1, 1.3]) },
      { rotate: `${interpolate(progress.value, [0, 1], [0, -12])}deg` },
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [0, 0.65]),
    transform: [{ scale: interpolate(progress.value, [0, 1], [0.6, 1.6]) }],
  }));

  const handleTap = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onOpen();
  };

  return (
    <View pointerEvents="box-none" style={styles.anchor}>
      <Animated.View pointerEvents="none" style={[styles.glow, glowStyle]} />
      <GestureDetector gesture={gesture}>
        <Animated.View style={btnStyle}>
          <Pressable
            onPress={handleTap}
            hitSlop={12}
            style={styles.btn}
            accessibilityLabel={accessibilityLabel}
          >
            <PullIcon size={22} color={colors.DARK} />
          </Pressable>
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  anchor: {
    position: 'absolute',
    right: 18,
    bottom: 78,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.LIME,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.LIME,
    shadowOpacity: 0.5,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  glow: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: colors.LIME,
  },
});
