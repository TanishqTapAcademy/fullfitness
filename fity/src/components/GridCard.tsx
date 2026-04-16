import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { colors } from '../theme/colors';
import { useSelectionPulse } from '../hooks/useSelectionPulse';

interface Props {
  icon: React.ReactNode;
  label: string;
  desc: string;
  selected: boolean;
  onPress: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const GridCard: React.FC<Props> = ({ icon, label, desc, selected, onPress }) => {
  const scale = useSharedValue(1);
  const { pulse, animatedStyle: iconPulseStyle } = useSelectionPulse();

  const aStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    borderColor: withTiming(selected ? colors.LIME : colors.GRAY, { duration: 200 }),
    backgroundColor: withTiming(selected ? 'rgba(232,255,107,0.08)' : colors.DARK2, {
      duration: 200,
    }),
  }));

  const handle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (!selected) pulse();
    onPress();
  };

  return (
    <AnimatedPressable
      onPress={handle}
      onPressIn={() => (scale.value = withTiming(0.97, { duration: 180, easing: Easing.out(Easing.cubic) }))}
      onPressOut={() => (scale.value = withTiming(1, { duration: 180, easing: Easing.out(Easing.cubic) }))}
      style={[styles.card, aStyle]}
    >
      <Animated.View style={[styles.iconWrap, iconPulseStyle]}>{icon}</Animated.View>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.desc}>{desc}</Text>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    justifyContent: 'space-between',
    minHeight: 140,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.DARK3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { color: colors.WHITE, fontSize: 16, fontWeight: '700' },
  desc: { color: colors.MUTED, fontSize: 12 },
});
