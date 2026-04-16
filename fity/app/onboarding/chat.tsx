import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, { Easing, FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { ScreenShell } from '../../src/components/ScreenShell';
import { CoachBubble } from '../../src/components/CoachBubble';
import { UserBubble } from '../../src/components/UserBubble';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { quitOpts, type QuitReason } from '../../src/data/onboarding';
import { useOnboardingStore } from '../../src/store/onboardingStore';
import { colors } from '../../src/theme/colors';

type Phase = 0 | 1 | 2 | 3 | 4 | 5;

export default function Chat() {
  const router = useRouter();
  const { quit, setQuit } = useOnboardingStore();
  const [phase, setPhase] = useState<Phase>(0);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(setTimeout(() => setPhase(1), 900));
    timers.push(setTimeout(() => setPhase(2), 1900));
    timers.push(setTimeout(() => setPhase(3), 3200));
    return () => timers.forEach(clearTimeout);
  }, []);

  const pickReason = (r: QuitReason) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setQuit(r);
    setPhase(4);
    setTimeout(() => setPhase(5), 1200);
  };

  const canContinue = phase === 5;

  return (
    <ScreenShell
      step={5}
      footer={
        <PrimaryButton
          label="Continue"
          disabled={!canContinue}
          onPress={() => router.push('/onboarding/auth')}
        />
      }
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
        <Text style={styles.title}>Meet your coach</Text>
        <Text style={styles.sub}>A quick chat to make this plan yours.</Text>

        <View style={{ marginTop: 24 }}>
          {phase >= 1 && <CoachBubble text="Your program is ready. Want to see it?" />}
          {phase === 1 && <CoachBubble typing />}
          {phase >= 2 && <CoachBubble text="One quick question first — it'll shape how I coach you." />}
          {phase === 2 && <CoachBubble typing />}
          {phase >= 3 && (
            <CoachBubble text="What's usually stopped you from sticking with training?" />
          )}

          {phase === 3 && (
            <Animated.View entering={FadeInUp.duration(350)} style={styles.chips}>
              {quitOpts.map((o) => (
                <Pressable
                  key={o.id}
                  onPress={() => pickReason(o.id)}
                  style={styles.chip}
                  hitSlop={8}
                >
                  <Text style={styles.chipText}>{o.label}</Text>
                </Pressable>
              ))}
            </Animated.View>
          )}

          {phase >= 4 && quit && (
            <UserBubble text={quitOpts.find((o) => o.id === quit)?.label ?? ''} />
          )}
          {phase === 4 && <CoachBubble typing />}
          {phase >= 5 && (
            <>
              <CoachBubble text="Understood. I've built a short, progressive week 1 so you win early. Let's preview it." />
              <Animated.View entering={FadeIn.duration(400)} style={styles.preview}>
                <Text style={styles.previewTitle}>Your week 1</Text>
                {[
                  { day: 'Mon', label: 'Full body strength', dur: '28 min' },
                  { day: 'Wed', label: 'Conditioning', dur: '20 min' },
                  { day: 'Fri', label: 'Lower focus', dur: '30 min' },
                  { day: 'Sun', label: 'Active recovery', dur: '15 min' },
                ].map((d, index) => (
                  <Animated.View
                    key={d.day}
                    entering={FadeInDown.duration(260)
                      .delay(index * 70)
                      .easing(Easing.out(Easing.cubic))}
                    style={styles.row}
                  >
                    <Text style={styles.rowDay}>{d.day}</Text>
                    <Text style={styles.rowLabel}>{d.label}</Text>
                    <Text style={styles.rowDur}>{d.dur}</Text>
                  </Animated.View>
                ))}
              </Animated.View>
            </>
          )}
        </View>
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.WHITE, fontSize: 28, fontWeight: '800' },
  sub: { color: colors.MUTED, fontSize: 15, marginTop: 6 },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
    marginBottom: 12,
    justifyContent: 'flex-end',
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.DARK3,
    borderWidth: 1,
    borderColor: colors.GRAY,
    minHeight: 44,
    justifyContent: 'center',
  },
  chipText: { color: colors.WHITE, fontSize: 14, fontWeight: '600' },
  preview: {
    marginTop: 12,
    padding: 16,
    borderRadius: 18,
    backgroundColor: colors.DARK2,
    borderWidth: 1,
    borderColor: colors.GRAY,
    gap: 10,
  },
  previewTitle: { color: colors.LIME, fontWeight: '700', fontSize: 14, letterSpacing: 0.5 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowDay: { color: colors.MUTED, width: 40, fontWeight: '700', fontSize: 13 },
  rowLabel: { color: colors.WHITE, flex: 1, fontSize: 14 },
  rowDur: { color: colors.MUTED, fontSize: 13 },
});
