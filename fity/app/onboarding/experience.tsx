import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenShell } from '../../src/components/ScreenShell';
import { OptionCard } from '../../src/components/OptionCard';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { CoachReply } from '../../src/components/CoachReply';
import { levelData } from '../../src/data/onboarding';
import { useOnboardingStore } from '../../src/store/onboardingStore';
import { colors } from '../../src/theme/colors';

export default function Experience() {
  const router = useRouter();
  const { level, setLevel } = useOnboardingStore();
  const canContinue = level !== null;

  return (
    <ScreenShell
      step={3}
      footer={
        <PrimaryButton
          label="Continue"
          disabled={!canContinue}
          onPress={() => router.push('/onboarding/body')}
        />
      }
    >
      <Text style={styles.title}>How experienced are you?</Text>
      <Text style={styles.sub}>So we pick the right starting intensity.</Text>
      <View style={{ gap: 10, marginTop: 20 }}>
        {levelData.map((l) => (
          <OptionCard
            key={l.id}
            label={l.label}
            desc={l.desc}
            selected={level === l.id}
            onPress={() => setLevel(l.id)}
          />
        ))}
      </View>
      {canContinue ? <CoachReply text="Got it. We'll start where you are and progress from there." /> : null}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.WHITE, fontSize: 28, fontWeight: '800' },
  sub: { color: colors.MUTED, fontSize: 15, marginTop: 6 },
});
