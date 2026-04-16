import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { ArrowLeftIcon, CoachAvatarIcon } from '../icons';

interface Props {
  onBack?: () => void;
  online?: boolean;
}

export const ChatHeader: React.FC<Props> = ({ onBack, online = true }) => {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.wrap, { paddingTop: insets.top + 6 }]}>
      <View style={styles.row}>
        {onBack ? (
          <Pressable onPress={onBack} hitSlop={12} style={styles.iconBtn}>
            <ArrowLeftIcon size={22} color={colors.WHITE} />
          </Pressable>
        ) : (
          <View style={styles.iconBtn} />
        )}
        <View style={styles.center}>
          <CoachAvatarIcon size={34} />
          <View>
            <Text style={styles.name}>Coach</Text>
            <View style={styles.statusRow}>
              <View style={[styles.dot, { backgroundColor: online ? colors.LIME : colors.MUTED }]} />
              <Text style={styles.status}>{online ? 'Online' : 'Away'}</Text>
            </View>
          </View>
        </View>
        <View style={styles.iconBtn} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.DARK,
    borderBottomWidth: 1,
    borderBottomColor: colors.GRAY,
    paddingBottom: 10,
    paddingHorizontal: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  center: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { color: colors.WHITE, fontSize: 15, fontWeight: '700' },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 1 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  status: { color: colors.MUTED, fontSize: 11, fontWeight: '600' },
});
