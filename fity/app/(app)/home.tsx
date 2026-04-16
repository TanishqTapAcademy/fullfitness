import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { colors } from '../../src/theme/colors';
import { HomeGreeting } from '../../src/components/home/HomeGreeting';
import { StreakCard } from '../../src/components/home/StreakCard';
import { TodayPlanCard } from '../../src/components/home/TodayPlanCard';
import { InsightCard } from '../../src/components/home/InsightCard';
import { CornerPullButton } from '../../src/components/CornerPullButton';
import { useProgressStore } from '../../src/store/progressStore';
import { DURATION, SPRING_SOFT, STAGGER } from '../../src/theme/motion';

const TODAY_BLOCKS = [
  'Warm-up · 3 min',
  'Squat · 3×8',
  'Push-up · 3×6',
  'Plank · 2×20s',
  'Cooldown · 2 min',
];

/**
 * Home surface. Pure status glance — streak, today's session, coach
 * insight. No CTAs compete for attention; the lime corner-pull button
 * is the single entry into Chat, mirroring Chat → Trace for UI uniformity.
 */
export default function Home() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { streak, init } = useProgressStore();

  useEffect(() => {
    init();
  }, [init]);

  // Layer reacts to corner-pull — scales to 0.92 and rounds the
  // bottom-right, the same peel used on Chat.
  const pullProgress = useSharedValue(0);
  const layerScale = useSharedValue(1);
  const layerRadius = useSharedValue(0);

  const layerStyle = useAnimatedStyle(() => {
    const p = pullProgress.value;
    const scale = 1 - p * 0.08;
    const radius = p * 40;
    return {
      transform: [{ scale: layerScale.value * scale }],
      borderBottomRightRadius: layerRadius.value + radius,
      borderBottomLeftRadius: radius * 0.4,
    };
  });

  const goToChat = () => {
    // Snap the layer back smoothly after the route pushes.
    layerScale.value = withSpring(1, SPRING_SOFT);
    layerRadius.value = withTiming(0, { duration: DURATION.base });
    router.push('/(app)/chat');
  };

  return (
    <View style={styles.root}>
      <Animated.View style={[styles.layer, layerStyle]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: insets.top + 4, paddingBottom: 120 }}
        >
          <HomeGreeting />
          <StreakCard streak={streak} delay={STAGGER.normal} />
          <TodayPlanCard
            title="Full body · foundations"
            durationMin={28}
            blocks={TODAY_BLOCKS}
            delay={STAGGER.normal * 2}
          />
          <InsightCard
            insight="Your squat looked strong in the baseline. I'll add a tempo cue today to lock in the pattern."
            delay={STAGGER.normal * 3}
          />
        </ScrollView>
      </Animated.View>
      <CornerPullButton
        onOpen={goToChat}
        progressSink={pullProgress}
        accessibilityLabel="Open Chat"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.DARK,
  },
  layer: {
    flex: 1,
    backgroundColor: colors.DARK,
    overflow: 'hidden',
  },
});
