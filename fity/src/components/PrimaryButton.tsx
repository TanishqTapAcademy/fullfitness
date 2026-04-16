import React from 'react';
import { Pressable, StyleSheet, Text, ViewStyle, StyleProp } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { colors } from '../theme/colors';

interface Props {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
  style?: StyleProp<ViewStyle>;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const PrimaryButton: React.FC<Props> = ({
  label,
  onPress,
  disabled = false,
  variant = 'primary',
  style,
}) => {
  const scale = useSharedValue(1);

  const aStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const bg =
    variant === 'primary'
      ? disabled
        ? colors.GRAY2
        : colors.LIME
      : variant === 'secondary'
      ? colors.DARK3
      : 'transparent';

  const fg =
    variant === 'primary' ? colors.DARK : colors.WHITE;

  return (
    <AnimatedPressable
      onPress={disabled ? undefined : onPress}
      onPressIn={() => {
        scale.value = withTiming(0.97, { duration: 90, easing: Easing.out(Easing.quad) });
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: 140, easing: Easing.out(Easing.quad) });
      }}
      style={[
        styles.btn,
        { backgroundColor: bg, opacity: disabled ? 0.6 : 1 },
        aStyle,
        style,
      ]}
      disabled={disabled}
    >
      <Text style={[styles.label, { color: fg }]}>{label}</Text>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  btn: {
    minHeight: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
