import React, { useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, { ZoomIn, FadeIn, FadeInDown, Easing } from 'react-native-reanimated';
import { ScreenShell } from '../../src/components/ScreenShell';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { CheckIcon } from '../../src/components/icons';
import { useOnboardingStore, type NotificationPrefs } from '../../src/store/onboardingStore';
import { colors } from '../../src/theme/colors';
import { equipData, goalData, levelData } from '../../src/data/onboarding';

const equipShort: Record<string, string> = {
  full_gym: 'Full gym',
  home: 'Home setup',
  bodyweight: 'Bodyweight',
  not_sure: 'Flexible',
};

const levelShort: Record<string, string> = {
  beginner: 'Beginner',
  some: 'Some exp.',
  consistent: 'Consistent',
  advanced: 'Advanced',
};

interface Row {
  key: keyof NotificationPrefs;
  label: string;
  desc: string;
}

const rows: Row[] = [
  { key: 'workoutReminders', label: 'Workout reminders', desc: 'Short nudge 15 min before your session' },
  { key: 'progressUpdates', label: 'Progress updates', desc: 'Weekly recap of wins and streaks' },
  { key: 'motivation', label: 'Daily motivation', desc: 'A short message to keep you going' },
];

export default function Notifications() {
  const { notifs, setNotif, goals, equip, level } = useOnboardingStore();
  const [done, setDone] = useState(false);

  const primaryGoal = goals[0]
    ? goalData.find((g) => g.id === goals[0])?.label.toLowerCase() ?? 'fitness'
    : 'fitness';
  const equipLabel = equip ? equipShort[equip] ?? equipData.find((e) => e.id === equip)?.label ?? 'Flexible' : 'Flexible';
  const levelLabel = level ? levelShort[level] ?? levelData.find((l) => l.id === level)?.label ?? 'Any level' : 'Any level';
  const daysPerWeek = 3;

  const finish = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setDone(true);
  };

  if (done) {
    return (
      <View style={styles.successRoot}>
        <Animated.View
          entering={FadeInDown.duration(320).delay(200).easing(Easing.out(Easing.cubic))}
          style={styles.recap}
        >
          <Text style={styles.recapLabel}>Your program</Text>
          <Text style={styles.recapLine}>{daysPerWeek} days/week · {primaryGoal} focus</Text>
          <Text style={styles.recapLine}>{equipLabel} · {levelLabel}</Text>
        </Animated.View>
        <Animated.View entering={ZoomIn.duration(320).easing(Easing.out(Easing.cubic))} style={styles.checkBig}>
          <CheckIcon size={54} color={colors.DARK} />
        </Animated.View>
        <Animated.Text entering={FadeIn.delay(150)} style={styles.successTitle}>
          You're in.
        </Animated.Text>
        <Animated.Text entering={FadeIn.delay(300)} style={styles.successSub}>
          Your first workout is ready when you are.
        </Animated.Text>
        <Animated.View entering={FadeIn.delay(500)} style={{ width: '100%', marginTop: 40 }}>
          <PrimaryButton
            label="Start training"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
            }}
          />
        </Animated.View>
      </View>
    );
  }

  return (
    <ScreenShell
      step={7}
      footer={<PrimaryButton label="Finish" onPress={finish} />}
    >
      <Text style={styles.title}>Stay on track</Text>
      <Text style={styles.sub}>Pick the notifications that help you show up.</Text>

      <View style={{ gap: 10, marginTop: 24 }}>
        {rows.map((r) => (
          <Pressable
            key={r.key}
            onPress={() => {
              Haptics.selectionAsync().catch(() => {});
              setNotif(r.key, !notifs[r.key]);
            }}
            style={styles.row}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>{r.label}</Text>
              <Text style={styles.rowDesc}>{r.desc}</Text>
            </View>
            <Switch
              value={notifs[r.key]}
              onValueChange={(v) => setNotif(r.key, v)}
              trackColor={{ false: colors.GRAY2, true: colors.LIME }}
              thumbColor={colors.WHITE}
              ios_backgroundColor={colors.GRAY2}
            />
          </Pressable>
        ))}
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.WHITE, fontSize: 28, fontWeight: '800' },
  sub: { color: colors.MUTED, fontSize: 15, marginTop: 6 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 18,
    backgroundColor: colors.DARK2,
    borderWidth: 1,
    borderColor: colors.GRAY,
    gap: 12,
    minHeight: 72,
  },
  rowLabel: { color: colors.WHITE, fontSize: 16, fontWeight: '600' },
  rowDesc: { color: colors.MUTED, fontSize: 13, marginTop: 2 },
  successRoot: {
    flex: 1,
    backgroundColor: colors.DARK,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  checkBig: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.LIME,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  successTitle: { color: colors.WHITE, fontSize: 30, fontWeight: '800' },
  successSub: { color: colors.MUTED, fontSize: 16, textAlign: 'center' },
  recap: {
    backgroundColor: colors.DARK3,
    borderWidth: 1,
    borderColor: colors.GRAY2,
    borderLeftWidth: 3,
    borderLeftColor: colors.LIME,
    borderRadius: 14,
    padding: 14,
    gap: 4,
    alignSelf: 'stretch',
    marginBottom: 8,
  },
  recapLabel: {
    color: colors.MUTED,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  recapLine: { color: colors.WHITE, fontSize: 14, fontWeight: '600' },
});
