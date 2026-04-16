import {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

export function useSelectionPulse() {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const pulse = () => {
    scale.value = withSequence(
      withTiming(1.08, { duration: 110, easing: Easing.out(Easing.cubic) }),
      withTiming(1, { duration: 110, easing: Easing.out(Easing.cubic) }),
    );
  };

  return { pulse, animatedStyle };
}
