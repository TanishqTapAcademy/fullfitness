import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenShell } from '../../src/components/ScreenShell';
import { OptionCard } from '../../src/components/OptionCard';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { CoachReply } from '../../src/components/CoachReply';
import { goalData, type GoalItem } from '../../src/data/onboarding';
import { useOnboardingStore } from '../../src/store/onboardingStore';
import {
  FireIcon,
  DumbbellIcon,
  TargetIcon,
  HeartPulseIcon,
  BoltIcon,
  BrainIcon,
  type IconProps,
} from '../../src/components/icons';
import { colors } from '../../src/theme/colors';

const iconMap: Record<GoalItem['icon'], React.FC<IconProps>> = {
  fire: FireIcon,
  dumbbell: DumbbellIcon,
  target: TargetIcon,
  heart: HeartPulseIcon,
  bolt: BoltIcon,
  brain: BrainIcon,
};

export default function Goals() {
  const router = useRouter();
  const { goals, toggleGoal } = useOnboardingStore();
  const canContinue = goals.length > 0;

  return (
    <ScreenShell
      step={1}
      footer={
        <PrimaryButton
          label="Continue"
          disabled={!canContinue}
          onPress={() => router.push('/onboarding/equipment')}
        />
      }
    >
      <Text style={styles.title}>What are your goals?</Text>
      <Text style={styles.sub}>Select what matters. I'll program the rest.</Text>
      <View style={{ gap: 10, marginTop: 20 }}>
        {goalData.map((g) => {
          const Icon = iconMap[g.icon];
          return (
            <OptionCard
              key={g.id}
              icon={<Icon size={22} color={colors.LIME} />}
              label={g.label}
              desc={g.desc}
              selected={goals.includes(g.id)}
              onPress={() => toggleGoal(g.id)}
            />
          );
        })}
      </View>
      {canContinue ? (
        <CoachReply
          text={
            goals.length === 1
              ? `Great pick. We'll focus on ${goalData.find((g) => g.id === goals[0])?.label.toLowerCase()}.`
              : `Nice combo — we'll balance ${goals.length} goals in your plan.`
          }
        />
      ) : null}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.WHITE, fontSize: 28, fontWeight: '800' },
  sub: { color: colors.MUTED, fontSize: 15, marginTop: 6 },
});
