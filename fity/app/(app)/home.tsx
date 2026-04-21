import React, { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors } from '../../src/theme/colors';
import { HomeGreeting } from '../../src/components/home/HomeGreeting';
import { StreakCard } from '../../src/components/home/StreakCard';
import { TodayPlanCard } from '../../src/components/home/TodayPlanCard';
import { InsightCard } from '../../src/components/home/InsightCard';
import { RecentLogsCard } from '../../src/components/home/RecentLogsCard';
import { CornerPullButton } from '../../src/components/CornerPullButton';
import { useProgressStore } from '../../src/store/progressStore';
import { useAuthStore } from '../../src/store/authStore';
import { DURATION, EASING_OUT_CUBIC, SPRING_SOFT, STAGGER } from '../../src/theme/motion';
import { trackEvent } from '../../src/services/posthog';

const FALLBACK_BLOCKS = [
  'Warm-up · 3 min',
  'Squat · 3×8',
  'Push-up · 3×6',
  'Plank · 2×20s',
  'Cooldown · 2 min',
];

export default function Home() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { streak, todayLogs, insight, init, fetchToday } = useProgressStore();
  const profile = useAuthStore((s) => s.profile);
  const session = useAuthStore((s) => s.session);
  const signOut = useAuthStore((s) => s.signOut);

  const isAuthenticated = !!session?.access_token;

  useEffect(() => {
    trackEvent('home_viewed', { is_authenticated: isAuthenticated });
    if (isAuthenticated) {
      fetchToday();
    } else {
      init();
    }
  }, [isAuthenticated, init, fetchToday]);

  const handleLogout = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    await signOut();
    router.replace('/onboarding/welcome');
  };

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
    layerScale.value = withSpring(1, SPRING_SOFT);
    layerRadius.value = withTiming(0, { duration: DURATION.base });
    router.push('/(app)/chat');
  };

  // Build today plan blocks from logs or fallback
  const planBlocks = todayLogs.length > 0
    ? todayLogs.map((l) => l.label)
    : FALLBACK_BLOCKS;

  const planTitle = todayLogs.length > 0
    ? `Today · ${todayLogs.length} logged`
    : 'Full body · foundations';

  const displayInsight = insight || "Your squat looked strong in the baseline. I'll add a tempo cue today to lock in the pattern.";

  return (
    <View style={styles.root}>
      <Animated.View style={[styles.layer, layerStyle]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: insets.top + 4, paddingBottom: 120 }}
        >
          {session && (
            <Animated.View
              entering={FadeInDown.duration(DURATION.base).easing(EASING_OUT_CUBIC)}
              style={styles.profileRow}
            >
              <View style={styles.profileLeft}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarEmoji}>{profile?.avatar || '👤'}</Text>
                </View>
                <Text style={styles.profileName} numberOfLines={1}>
                  {profile?.display_name || profile?.email || 'User'}
                </Text>
              </View>
              <Pressable onPress={handleLogout} style={styles.logoutBtn} hitSlop={8}>
                <Text style={styles.logoutText}>Log out</Text>
              </Pressable>
            </Animated.View>
          )}
          <HomeGreeting name={profile?.display_name ?? undefined} />
          <StreakCard streak={streak} delay={STAGGER.normal} />
          <TodayPlanCard
            title={planTitle}
            durationMin={todayLogs.length > 0 ? todayLogs.length : 28}
            blocks={planBlocks}
            delay={STAGGER.normal * 2}
          />
          <InsightCard
            insight={displayInsight}
            delay={STAGGER.normal * 3}
          />
          {isAuthenticated && todayLogs.length > 0 && (
            <RecentLogsCard logs={todayLogs} delay={STAGGER.normal * 4} />
          )}
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
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  profileLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.DARK3,
    borderWidth: 1,
    borderColor: colors.GRAY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: {
    fontSize: 18,
  },
  profileName: {
    color: colors.WHITE,
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  logoutBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.GRAY2,
    backgroundColor: colors.DARK3,
  },
  logoutText: {
    color: colors.MUTED,
    fontSize: 12,
    fontWeight: '600',
  },
});
