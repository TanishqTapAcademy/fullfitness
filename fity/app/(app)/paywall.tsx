import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
  interpolateColor,
  Easing,
} from 'react-native-reanimated';
import { X, Check, Zap, Crown, Sparkles } from 'lucide-react-native';
import { colors } from '../../src/theme/colors';
import { useSubscriptionStore } from '../../src/store/subscriptionStore';
import { DEV_FORCE_PREMIUM } from '../../src/services/adapty';
import { devTogglePremium } from '../../src/services/chatApi';
import { trackEvent } from '../../src/services/posthog';
import {
  DURATION,
  STAGGER,
  SPRING_BOUNCE,
  SPRING_SOFT,
  EASING_OUT_CUBIC,
} from '../../src/theme/motion';

const { width: SCREEN_W } = Dimensions.get('window');

const FEATURES = [
  { text: 'Unlimited daily coach messages', icon: '💬' },
  { text: 'Food photo calorie analysis', icon: '📸' },
  { text: 'Exercise form check from photos', icon: '💪' },
  { text: 'Advanced metrics & trends', icon: '📊' },
  { text: 'Personalized daily nudges', icon: '🔔' },
  { text: 'Weekly AI progress reports', icon: '📈' },
];

type Plan = 'annual' | 'monthly';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function Paywall() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedPlan, setSelectedPlan] = useState<Plan>('annual');
  const [purchasing, setPurchasing] = useState(false);
  const { setPremium } = useSubscriptionStore();

  // --- Animated values ---
  const crownScale = useSharedValue(0);
  const crownRotate = useSharedValue(0);
  const glowOpacity = useSharedValue(0);
  const glowScale = useSharedValue(0.6);
  const shimmerX = useSharedValue(-SCREEN_W);
  const ctaPulse = useSharedValue(1);
  const annualBorderColor = useSharedValue(1); // 1 = lime
  const monthlyBorderColor = useSharedValue(0);

  useEffect(() => {
    trackEvent('paywall_viewed');

    // Crown: bounce in with overshoot
    crownScale.value = withDelay(200, withSpring(1, SPRING_BOUNCE));
    crownRotate.value = withDelay(200, withSequence(
      withTiming(-8, { duration: 150 }),
      withSpring(0, { damping: 4, stiffness: 200, mass: 0.4 }),
    ));

    // Glow pulse behind crown — continuous
    glowOpacity.value = withDelay(400, withRepeat(
      withSequence(
        withTiming(0.5, { duration: 1200 }),
        withTiming(0.15, { duration: 1200 }),
      ),
      -1, true,
    ));
    glowScale.value = withDelay(400, withRepeat(
      withSequence(
        withTiming(1.3, { duration: 1200 }),
        withTiming(0.9, { duration: 1200 }),
      ),
      -1, true,
    ));

    // Shimmer sweep across CTA — repeating
    shimmerX.value = withDelay(1200, withRepeat(
      withSequence(
        withTiming(SCREEN_W * 1.5, { duration: 1400, easing: Easing.inOut(Easing.quad) }),
        withDelay(2000, withTiming(-SCREEN_W, { duration: 0 })),
      ),
      -1,
    ));

    // CTA gentle pulse
    ctaPulse.value = withDelay(1000, withRepeat(
      withSequence(
        withTiming(1.025, { duration: 800 }),
        withTiming(1, { duration: 800 }),
      ),
      -1, true,
    ));
  }, []);

  // Update border highlight when plan changes
  useEffect(() => {
    annualBorderColor.value = withTiming(selectedPlan === 'annual' ? 1 : 0, { duration: DURATION.fast });
    monthlyBorderColor.value = withTiming(selectedPlan === 'monthly' ? 1 : 0, { duration: DURATION.fast });
  }, [selectedPlan]);

  const crownStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: crownScale.value },
      { rotate: `${crownRotate.value}deg` },
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scale: glowScale.value }],
  }));

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerX.value }],
  }));

  const ctaScaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ctaPulse.value }],
  }));

  const annualStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(annualBorderColor.value, [0, 1], [colors.GRAY, colors.LIME]),
    backgroundColor: interpolateColor(annualBorderColor.value, [0, 1], [colors.DARK2, colors.DARK3]),
  }));

  const monthlyStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(monthlyBorderColor.value, [0, 1], [colors.GRAY, colors.LIME]),
    backgroundColor: interpolateColor(monthlyBorderColor.value, [0, 1], [colors.DARK2, colors.DARK3]),
  }));

  const handleClose = () => {
    Haptics.selectionAsync().catch(() => {});
    router.back();
  };

  const handleSelectPlan = (plan: Plan) => {
    Haptics.selectionAsync().catch(() => {});
    setSelectedPlan(plan);
  };

  const handlePurchase = async () => {
    setPurchasing(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    trackEvent('paywall_purchase_tapped', { plan: selectedPlan });

    if (typeof DEV_FORCE_PREMIUM === 'boolean') {
      await devTogglePremium();
      setPremium(true);
      setTimeout(() => router.back(), 300);
      return;
    }

    // Production: Adapty purchase flow will go here
    setPurchasing(false);
  };

  const handleRestore = async () => {
    trackEvent('paywall_restore_tapped');
    if (typeof DEV_FORCE_PREMIUM === 'boolean') {
      setPremium(true);
      router.back();
    }
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Close button */}
      <Animated.View entering={FadeIn.delay(600).duration(DURATION.base)}>
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={handleClose}
          hitSlop={16}
        >
          <X size={22} color={colors.MUTED} />
        </TouchableOpacity>
      </Animated.View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* ── Header with animated crown ── */}
        <View style={styles.header}>
          <View style={styles.crownWrap}>
            {/* Pulsing glow */}
            <Animated.View style={[styles.glow, glowStyle]} />
            {/* Crown icon */}
            <Animated.View style={[styles.iconCircle, crownStyle]}>
              <Crown size={30} color={colors.DARK} strokeWidth={2.5} />
            </Animated.View>
          </View>

          <Animated.Text
            entering={FadeInDown.delay(350).duration(DURATION.slow).easing(EASING_OUT_CUBIC)}
            style={styles.title}
          >
            Unlock Your{'\n'}Full Coach
          </Animated.Text>
          <Animated.Text
            entering={FadeIn.delay(500).duration(DURATION.slow)}
            style={styles.subtitle}
          >
            Get unlimited access to your AI fitness coach
          </Animated.Text>
        </View>

        {/* ── Features — staggered entrance ── */}
        <View style={styles.features}>
          {FEATURES.map((f, i) => (
            <Animated.View
              key={f.text}
              entering={FadeInDown
                .delay(500 + i * STAGGER.tight)
                .duration(DURATION.base)
                .easing(EASING_OUT_CUBIC)
              }
              style={styles.featureRow}
            >
              <View style={styles.checkCircle}>
                <Check size={13} color={colors.DARK} strokeWidth={3} />
              </View>
              <Text style={styles.featureText}>{f.text}</Text>
            </Animated.View>
          ))}
        </View>

        {/* ── Plan cards — animated borders ── */}
        <Animated.View
          entering={FadeInDown.delay(800).duration(DURATION.slow).easing(EASING_OUT_CUBIC)}
          style={styles.plans}
        >
          {/* Annual */}
          <AnimatedTouchable
            style={[styles.planCard, annualStyle]}
            onPress={() => handleSelectPlan('annual')}
            activeOpacity={0.85}
          >
            <View style={styles.badgeWrap}>
              <View style={styles.badge}>
                <Sparkles size={10} color={colors.DARK} />
                <Text style={styles.badgeText}>BEST VALUE</Text>
              </View>
            </View>
            <View style={styles.planRow}>
              <View style={[styles.radio, selectedPlan === 'annual' && styles.radioSelected]}>
                {selectedPlan === 'annual' && (
                  <Animated.View
                    entering={FadeIn.duration(150)}
                    style={styles.radioDot}
                  />
                )}
              </View>
              <View style={styles.planInfo}>
                <Text style={styles.planName}>Annual</Text>
                <Text style={styles.planPrice}>$59.99/year</Text>
                <Text style={styles.planSub}>Just $4.99/mo — Save 50%</Text>
              </View>
            </View>
          </AnimatedTouchable>

          {/* Monthly */}
          <AnimatedTouchable
            style={[styles.planCard, monthlyStyle]}
            onPress={() => handleSelectPlan('monthly')}
            activeOpacity={0.85}
          >
            <View style={styles.planRow}>
              <View style={[styles.radio, selectedPlan === 'monthly' && styles.radioSelected]}>
                {selectedPlan === 'monthly' && (
                  <Animated.View
                    entering={FadeIn.duration(150)}
                    style={styles.radioDot}
                  />
                )}
              </View>
              <View style={styles.planInfo}>
                <Text style={styles.planName}>Monthly</Text>
                <Text style={styles.planPrice}>$9.99/month</Text>
              </View>
            </View>
          </AnimatedTouchable>
        </Animated.View>

        {/* ── CTA with shimmer + pulse ── */}
        <Animated.View
          entering={FadeInUp.delay(1000).duration(DURATION.slow).easing(EASING_OUT_CUBIC)}
        >
          <AnimatedTouchable
            style={[styles.cta, ctaScaleStyle, purchasing && styles.ctaDisabled]}
            onPress={handlePurchase}
            activeOpacity={0.85}
            disabled={purchasing}
          >
            {/* Shimmer overlay */}
            <Animated.View style={[styles.shimmer, shimmerStyle]} />
            <Zap size={18} color={colors.DARK} />
            <Text style={styles.ctaText}>
              {purchasing ? 'Processing...' : 'Start 7-Day Free Trial'}
            </Text>
          </AnimatedTouchable>
        </Animated.View>

        <Animated.Text
          entering={FadeIn.delay(1100).duration(DURATION.base)}
          style={styles.trialNote}
        >
          Cancel anytime. You won't be charged during the trial.
        </Animated.Text>

        {/* Restore */}
        <Animated.View entering={FadeIn.delay(1200).duration(DURATION.base)}>
          <TouchableOpacity onPress={handleRestore} style={styles.restoreBtn}>
            <Text style={styles.restoreText}>Restore purchases</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.DARK,
  },
  closeBtn: {
    position: 'absolute',
    top: 12,
    right: 20,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.DARK3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 52,
    paddingBottom: 40,
  },

  // ── Header ──
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  crownWrap: {
    width: 88,
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  glow: {
    position: 'absolute',
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.LIME,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.LIME,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.WHITE,
    textAlign: 'center',
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 15,
    color: colors.MUTED,
    marginTop: 8,
    textAlign: 'center',
  },

  // ── Features ──
  features: {
    marginBottom: 26,
    gap: 13,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.LIME,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    fontSize: 15,
    color: colors.WHITE,
    flex: 1,
  },

  // ── Plans ──
  plans: {
    gap: 12,
    marginBottom: 22,
  },
  planCard: {
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 16,
    overflow: 'hidden',
  },
  badgeWrap: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.LIME,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderBottomLeftRadius: 10,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.DARK,
    letterSpacing: 0.5,
  },
  planRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.GRAY2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: colors.LIME,
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.LIME,
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.WHITE,
  },
  planPrice: {
    fontSize: 14,
    color: colors.WHITE,
    marginTop: 2,
  },
  planSub: {
    fontSize: 12,
    color: colors.LIME,
    marginTop: 2,
    fontWeight: '600',
  },

  // ── CTA ──
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.LIME,
    paddingVertical: 16,
    borderRadius: 14,
    marginBottom: 12,
    overflow: 'hidden',
  },
  ctaDisabled: {
    opacity: 0.6,
  },
  ctaText: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.DARK,
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 60,
    backgroundColor: 'rgba(255,255,255,0.25)',
    transform: [{ skewX: '-20deg' }],
  },
  trialNote: {
    fontSize: 12,
    color: colors.MUTED,
    textAlign: 'center',
    marginBottom: 16,
  },
  restoreBtn: {
    alignSelf: 'center',
    paddingVertical: 8,
  },
  restoreText: {
    fontSize: 13,
    color: colors.MUTED,
    textDecorationLine: 'underline',
  },
});
