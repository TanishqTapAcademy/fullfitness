import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { ArrowLeftIcon } from '../icons';

interface Props {
  onBack: () => void;
  dayCount: number;
}

export const TraceHeader: React.FC<Props> = ({ onBack, dayCount }) => {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.wrap, { paddingTop: insets.top + 8 }]}>
      <Pressable onPress={onBack} hitSlop={12} style={styles.btn} accessibilityLabel="Back">
        <ArrowLeftIcon size={22} color={colors.WHITE} />
      </Pressable>
      <Text style={styles.title}>Trace</Text>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{dayCount}d</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingBottom: 10,
    backgroundColor: colors.DARK,
  },
  btn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: colors.WHITE,
    fontSize: 17,
    fontWeight: '800',
  },
  badge: {
    minWidth: 40,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.DARK3,
    borderWidth: 1,
    borderColor: colors.GRAY,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  badgeText: {
    color: colors.LIME,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
