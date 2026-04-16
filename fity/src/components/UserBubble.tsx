import React from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { colors } from '../theme/colors';

interface Props {
  text: string;
}

export const UserBubble: React.FC<Props> = ({ text }) => (
  <Animated.View entering={FadeInUp.duration(300)} style={styles.bubble}>
    <Text style={styles.text}>{text}</Text>
  </Animated.View>
);

const styles = StyleSheet.create({
  bubble: {
    alignSelf: 'flex-end',
    backgroundColor: colors.LIME,
    padding: 14,
    borderRadius: 18,
    borderTopRightRadius: 4,
    maxWidth: '80%',
    marginBottom: 12,
  },
  text: { color: colors.DARK, fontSize: 15, fontWeight: '600' },
});
