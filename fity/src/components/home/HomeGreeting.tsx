import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors } from '../../theme/colors';
import { DURATION, EASING_OUT_CUBIC } from '../../theme/motion';

interface Props {
  name?: string;
}

/**
 * Time-of-day aware greeting. Kept tiny on purpose — the emotional weight
 * sits in the StreakCard below.
 */
export const HomeGreeting: React.FC<Props> = ({ name }) => {
  const hour = new Date().getHours();
  const part = hour < 12 ? 'Morning' : hour < 18 ? 'Afternoon' : 'Evening';
  const who = name ? `, ${name}` : '';

  return (
    <Animated.View
      entering={FadeInDown.duration(DURATION.base).easing(EASING_OUT_CUBIC)}
      style={styles.wrap}
    >
      <Text style={styles.label}>{part}{who}</Text>
      <View style={styles.readyRow}>
        <Text style={styles.ready}>Ready?</Text>
        <View style={styles.pill}><Text style={styles.pillText}>Day 1</Text></View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  label: {
    color: colors.MUTED,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  readyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  ready: {
    color: colors.WHITE,
    fontSize: 32,
    fontWeight: '800',
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: colors.DARK3,
    borderWidth: 1,
    borderColor: colors.GRAY,
  },
  pillText: { color: colors.LIME, fontSize: 11, fontWeight: '700', letterSpacing: 0.6 },
});
