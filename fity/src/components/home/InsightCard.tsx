import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors } from '../../theme/colors';
import { CoachAvatarIcon } from '../icons';
import { DURATION, EASING_OUT_CUBIC } from '../../theme/motion';

interface Props {
  insight: string;
  delay?: number;
}

/**
 * Passive coach insight card. No CTA — the corner-pull button is the
 * single entry point into Chat, keeping the home surface quiet.
 */
export const InsightCard: React.FC<Props> = ({ insight, delay = 0 }) => (
  <Animated.View
    entering={FadeInDown.duration(DURATION.slow).delay(delay).easing(EASING_OUT_CUBIC)}
    style={styles.card}
  >
    <View style={styles.row}>
      <CoachAvatarIcon size={36} />
      <View style={{ flex: 1 }}>
        <Text style={styles.label}>Coach insight</Text>
        <Text style={styles.text}>{insight}</Text>
      </View>
    </View>
  </Animated.View>
);

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginTop: 14,
    borderRadius: 20,
    backgroundColor: colors.DARK3,
    borderWidth: 1,
    borderColor: colors.GRAY,
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  label: {
    color: colors.MUTED,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  text: {
    color: colors.WHITE,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
});
