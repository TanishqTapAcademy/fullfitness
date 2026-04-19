import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'react-native';
import { colors } from '../../src/theme/colors';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { useOnboardingStore } from '../../src/store/onboardingStore';

export default function Welcome() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const fetchQuestions = useOnboardingStore((s) => s.fetchQuestions);

  // Prefetch questions while user sees the welcome screen
  useEffect(() => {
    fetchQuestions();
  }, []);

  return (
    <View style={[styles.root, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 20 }]}>
      <StatusBar style="light" />
      <View style={styles.center}>
        <Animated.View entering={FadeIn.duration(600)}>
          <Image
            source={require('../../src/components/icons/logo/20260418_1714_Transparent Background Object_remix_01kpg6fkhcfkys89k1bed1m3nj.png')}
            style={{ width: 240, height: 240 }}
            resizeMode="contain"
          />
        </Animated.View>
        <Animated.Text entering={FadeInDown.delay(200).duration(500)} style={styles.title}>
          Train Smarter.{'\n'}Move Better.
        </Animated.Text>
        <Animated.Text entering={FadeInDown.delay(350).duration(500)} style={styles.sub}>
          Your coach is ready. Two minutes to build your program.
        </Animated.Text>
      </View>
      <View style={styles.footer}>
        <PrimaryButton label="Get started" onPress={() => router.push('/onboarding/questions')} />
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
