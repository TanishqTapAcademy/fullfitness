import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { CloseIcon } from '../icons';
import { BaselineProgressDots } from './BaselineProgressDots';

interface Props {
  onClose: () => void;
  total: number;
  current: number;
}

export const BaselineHeader: React.FC<Props> = ({ onClose, total, current }) => {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.wrap, { paddingTop: insets.top + 10 }]}>
      <View style={styles.row}>
        <Pressable onPress={onClose} hitSlop={12} style={styles.btn} accessibilityLabel="Close">
          <CloseIcon size={20} color={colors.WHITE} />
        </Pressable>
        <Text style={styles.title}>Movement baseline</Text>
        <View style={styles.btn} />
      </View>
      <View style={styles.dotsRow}>
        <BaselineProgressDots total={total} current={current} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: colors.DARK,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  btn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { color: colors.WHITE, fontSize: 15, fontWeight: '700' },
  dotsRow: { marginTop: 14, alignItems: 'center' },
});
