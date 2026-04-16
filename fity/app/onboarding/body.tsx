import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';
import { ScreenShell } from '../../src/components/ScreenShell';
import { Wheel } from '../../src/components/Wheel';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { useOnboardingStore } from '../../src/store/onboardingStore';
import { colors } from '../../src/theme/colors';

type Phase = 'height' | 'weight';

export default function Body() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('height');
  const { height, weight, setHeight, setWeight } = useOnboardingStore();

  const isHeight = phase === 'height';

  return (
    <ScreenShell
      step={4}
      hideBack={false}
      scroll={false}
      footer={
        <PrimaryButton
          label={isHeight ? 'Next' : 'Continue'}
          onPress={() => {
            if (isHeight) setPhase('weight');
            else router.push('/onboarding/chat');
          }}
        />
      }
    >
      <Animated.View key={phase} entering={FadeIn.duration(250)} style={styles.inner}>
        <Text style={styles.title}>
          {isHeight ? 'How tall are you?' : 'What do you weigh?'}
        </Text>
        <Text style={styles.sub}>Quick stats for precision. Skip if you want.</Text>

        <View style={styles.wheelWrap}>
          {isHeight ? (
            <Wheel min={140} max={220} value={height} onChange={setHeight} suffix="cm" />
          ) : (
            <Wheel min={35} max={180} value={weight} onChange={setWeight} suffix="kg" />
          )}
        </View>

        <View style={styles.pills}>
          <View style={[styles.pill, isHeight && styles.pillActive]}>
            <Text style={[styles.pillText, isHeight && styles.pillTextActive]}>Height</Text>
          </View>
          <View style={[styles.pill, !isHeight && styles.pillActive]}>
            <Text style={[styles.pillText, !isHeight && styles.pillTextActive]}>Weight</Text>
          </View>
        </View>
      </Animated.View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  inner: { flex: 1, paddingTop: 10 },
  title: { color: colors.WHITE, fontSize: 28, fontWeight: '800' },
  sub: { color: colors.MUTED, fontSize: 15, marginTop: 6 },
  wheelWrap: { flex: 1, justifyContent: 'center', marginTop: 20 },
  pills: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.DARK3,
  },
  pillActive: { backgroundColor: colors.LIME },
  pillText: { color: colors.MUTED, fontSize: 13, fontWeight: '600' },
  pillTextActive: { color: colors.DARK },
});
