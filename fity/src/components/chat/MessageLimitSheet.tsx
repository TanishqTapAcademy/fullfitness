import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Zap, MessageCircle } from 'lucide-react-native';
import { colors } from '../../theme/colors';

interface Props {
  remaining: number;
  limit: number;
  onUpgrade: () => void;
  onDismiss: () => void;
}

export function MessageLimitSheet({ remaining, limit, onUpgrade, onDismiss }: Props) {
  const used = limit - remaining;

  return (
    <View style={styles.root}>
      <View style={styles.card}>
        <View style={styles.iconRow}>
          <MessageCircle size={20} color={colors.LIME} />
          <Text style={styles.title}>
            {remaining === 0
              ? 'Daily limit reached'
              : `${remaining} message${remaining === 1 ? '' : 's'} left today`}
          </Text>
        </View>

        {/* Progress bar */}
        <View style={styles.barBg}>
          <View
            style={[styles.barFill, { width: `${(used / limit) * 100}%` }]}
          />
        </View>
        <Text style={styles.count}>{used}/{limit} free messages used</Text>

        {remaining === 0 ? (
          <>
            <TouchableOpacity style={styles.upgradeBtn} onPress={onUpgrade} activeOpacity={0.85}>
              <Zap size={16} color={colors.DARK} />
              <Text style={styles.upgradeBtnText}>Upgrade for unlimited</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onDismiss} style={styles.laterBtn}>
              <Text style={styles.laterText}>Maybe later</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity onPress={onDismiss} style={styles.laterBtn}>
            <Text style={styles.laterText}>Got it</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  card: {
    backgroundColor: colors.DARK2,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.GRAY,
    padding: 16,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.WHITE,
  },
  barBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.GRAY,
    marginBottom: 6,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: colors.LIME,
  },
  count: {
    fontSize: 12,
    color: colors.MUTED,
    marginBottom: 14,
  },
  upgradeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.LIME,
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  upgradeBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.DARK,
  },
  laterBtn: {
    alignSelf: 'center',
    paddingVertical: 6,
  },
  laterText: {
    fontSize: 13,
    color: colors.MUTED,
  },
});
