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
import { CheckIcon } from './icons';
import { useSelectionPulse } from '../hooks/useSelectionPulse';

interface Props {
  icon?: React.ReactNode;
  label: string;
  desc?: string;
  selected: boolean;
  onPress: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const OptionCard: React.FC<Props> = ({ icon, label, desc, selected, onPress }) => {
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
      onPressIn={() => (scale.value = withTiming(0.98, { duration: 180, easing: Easing.out(Easing.cubic) }))}
      onPressOut={() => (scale.value = withTiming(1, { duration: 180, easing: Easing.out(Easing.cubic) }))}
      style={[styles.card, aStyle]}
    >
      {icon ? <Animated.View style={[styles.iconWrap, iconPulseStyle]}>{icon}</Animated.View> : null}
      <View style={styles.text}>
        <Text style={styles.label}>{label}</Text>
        {desc ? <Text style={styles.desc}>{desc}</Text> : null}
      </View>
      <View
        style={[
          styles.check,
          { backgroundColor: selected ? colors.LIME : 'transparent', borderColor: selected ? colors.LIME : colors.GRAY2 },
        ]}
      >
        {selected ? <CheckIcon size={14} color={colors.DARK} /> : null}
      </View>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    gap: 14,
    minHeight: 72,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.DARK3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1 },
  label: { color: colors.WHITE, fontSize: 16, fontWeight: '600' },
  desc: { color: colors.MUTED, fontSize: 13, marginTop: 2 },
  check: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
