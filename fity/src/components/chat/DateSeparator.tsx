import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';

interface Props {
  label: string;
}

export const DateSeparator: React.FC<Props> = ({ label }) => (
  <View style={styles.wrapper}>
    <View style={styles.pill}>
      <Text style={styles.text}>{label}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    marginVertical: 12,
  },
  pill: {
    backgroundColor: colors.DARK3,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  text: {
    color: colors.MUTED,
    fontSize: 12,
  },
});
