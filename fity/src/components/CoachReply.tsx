import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { colors } from '../theme/colors';

interface Props {
  text: string;
}

export const CoachReply: React.FC<Props> = ({ text }) => (
  <Animated.View entering={FadeIn.duration(350)} style={styles.wrap}>
    <View style={styles.dot} />
    <Text style={styles.text}>
      <Text style={styles.label}>Coach: </Text>
      {text}
    </Text>
  </Animated.View>
);

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    gap: 10,
    padding: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(232,255,107,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(232,255,107,0.3)',
    marginTop: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.LIME,
    marginTop: 6,
  },
  text: { color: colors.WHITE, fontSize: 14, lineHeight: 20, flex: 1 },
  label: { color: colors.LIME, fontWeight: '700' },
});
