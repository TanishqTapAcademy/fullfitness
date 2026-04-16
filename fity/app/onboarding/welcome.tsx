import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../../src/theme/colors';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { HeroIllustration } from '../../src/components/icons';

export default function Welcome() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 20 }]}>
      <StatusBar style="light" />
      <View style={styles.center}>
        <Animated.View entering={FadeIn.duration(600)}>
          <HeroIllustration size={240} />
        </Animated.View>
        <Animated.Text entering={FadeInDown.delay(200).duration(500)} style={styles.title}>
          Train smarter.{'\n'}Move better.
        </Animated.Text>
        <Animated.Text entering={FadeInDown.delay(350).duration(500)} style={styles.sub}>
          Your coach is ready. Two minutes to build your program.
        </Animated.Text>
      </View>
      <View style={styles.footer}>
        <PrimaryButton label="Get started" onPress={() => router.push('/onboarding/goals')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.DARK, paddingHorizontal: 20 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 20 },
  title: {
    color: colors.WHITE,
    fontSize: 34,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 40,
    marginTop: 8,
  },
  sub: {
    color: colors.MUTED,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  footer: { gap: 10 },
});
