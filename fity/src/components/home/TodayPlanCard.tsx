import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors } from '../../theme/colors';
import { DumbbellIcon } from '../icons';
import { DURATION, EASING_OUT_CUBIC } from '../../theme/motion';

interface Props {
  title: string;
  durationMin: number;
  blocks: string[];
  delay?: number;
}

/**
 * Passive "today's session" summary. No CTA — the corner-pull button is
 * the single way into Chat, where the session actually starts.
 */
export const TodayPlanCard: React.FC<Props> = ({ title, durationMin, blocks, delay = 0 }) => (
  <Animated.View
    entering={FadeInDown.duration(DURATION.slow).delay(delay).easing(EASING_OUT_CUBIC)}
    style={styles.card}
  >
    <View style={styles.topRow}>
      <View style={styles.iconWrap}>
        <DumbbellIcon size={20} color={colors.LIME} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.label}>Today&apos;s session</Text>
        <Text style={styles.title}>{title}</Text>
      </View>
      <View style={styles.duration}>
        <Text style={styles.durationValue}>{durationMin}</Text>
        <Text style={styles.durationUnit}>min</Text>
      </View>
    </View>

    <View style={styles.blocks}>
      {blocks.map((b, i) => (
        <View key={b} style={styles.block}>
          <Text style={styles.blockNum}>{i + 1}</Text>
          <Text style={styles.blockText}>{b}</Text>
        </View>
      ))}
    </View>
  </Animated.View>
);

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginTop: 14,
    borderRadius: 24,
    backgroundColor: colors.DARK2,
    borderWidth: 1,
    borderColor: colors.GRAY,
    padding: 18,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.DARK3,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.GRAY,
  },
  label: {
    color: colors.MUTED,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.WHITE,
    fontSize: 18,
    fontWeight: '800',
    marginTop: 2,
  },
  duration: {
    alignItems: 'flex-end',
  },
  durationValue: {
    color: colors.LIME,
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 24,
  },
  durationUnit: {
    color: colors.MUTED,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.6,
  },
  blocks: {
    marginTop: 14,
    gap: 6,
  },
  block: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
  },
  blockNum: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.DARK3,
    color: colors.LIME,
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 22,
    overflow: 'hidden',
  },
  blockText: { color: colors.WHITE, fontSize: 14, flex: 1 },
});
