import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { colors } from '../../theme/colors';
import { DURATION, EASING_OUT_CUBIC } from '../../theme/motion';

interface Props {
  label: string;
  onPress: () => void;
  /** Optional support text above the CTA. */
  subtitle?: string;
}

/**
 * A lime CTA card that appears inline in the chat — e.g. "Do the baseline now".
 */
export const InlineActionCard: React.FC<Props> = ({ label, onPress, subtitle }) => {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    onPress();
  };

  return (
    <Animated.View
      entering={FadeInUp.duration(DURATION.base).easing(EASING_OUT_CUBIC)}
      style={styles.wrap}
    >
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      <Pressable onPress={handlePress} style={styles.btn} hitSlop={6}>
        <Text style={styles.label}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'flex-start',
    marginTop: 6,
    marginBottom: 10,
    marginLeft: 40,
    maxWidth: '80%',
  },
  subtitle: {
    color: colors.MUTED,
    fontSize: 12,
    marginBottom: 6,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  btn: {
    backgroundColor: colors.LIME,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 16,
    minHeight: 48,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  label: {
    color: colors.DARK,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
