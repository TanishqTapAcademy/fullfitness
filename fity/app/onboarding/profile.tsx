import React, { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { colors } from '../../src/theme/colors';
import { DURATION, EASING_OUT_CUBIC } from '../../src/theme/motion';
import { useAuthStore } from '../../src/store/authStore';
import { onboardingApi } from '../../src/services/api';
import { getOrCreateDeviceId } from '../../src/services/userId';

const APressable = Animated.createAnimatedComponent(Pressable);

// Curated emoji avatars
const EMOJI_CATEGORIES = [
  {
    label: 'Sports & Fitness',
    emojis: [
      '🏋️', '🏃', '🚴', '⚽', '🏀', '🎾', '🏊', '🧗',
      '🤸', '🥊', '🏄', '⛷️', '🤾', '🏇', '🚣', '🤺',
    ],
  },
  {
    label: 'Health & Wellness',
    emojis: [
      '🧘', '💪', '❤️', '🔥', '⭐', '🌟', '💎', '🍎',
      '🥗', '🧠', '🌿', '🏆', '🎯', '⚡', '🌈', '☀️',
    ],
  },
  {
    label: 'Animals',
    emojis: [
      '🐱', '🐶', '🐻', '🐼', '🦊', '🐰', '🦁', '🐯',
      '🐨', '🦄', '🐸', '🐧', '🦋', '🐬', '🐺', '🦉',
    ],
  },
];

export default function Profile() {
  const router = useRouter();
  const { setProfile, setIsNewUser } = useAuthStore();
  const isNewUser = useAuthStore((s) => s.isNewUser);
  const redirected = useRef(false);

  // If the background sync resolves and the user is existing, redirect to Home
  useEffect(() => {
    if (isNewUser === false && !redirected.current) {
      redirected.current = true;
      router.replace('/(app)/home');
    }
  }, [isNewUser, router]);

  const [name, setName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('');

  const btnScale = useSharedValue(1);
  const btnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: btnScale.value }],
  }));

  const canContinue = name.trim().length > 0 && selectedEmoji.length > 0;

  const handleContinue = () => {
    if (!canContinue) return;

    // Navigate immediately — save in background (fire-and-forget)
    router.push('/onboarding/notifications');

    // Update store optimistically
    setIsNewUser(false);

    // Save to backend in background
    getOrCreateDeviceId()
      .then((deviceId) =>
        onboardingApi.syncUser(deviceId, {
          display_name: name.trim(),
          avatar: selectedEmoji,
        })
      )
      .then((result) => {
        if (result.user) setProfile(result.user);
      })
      .catch(() => {
        // Non-critical — profile will sync next time
      });
  };

  return (
    <View style={styles.root}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <Animated.View
            entering={FadeInDown.duration(DURATION.base).easing(EASING_OUT_CUBIC)}
            style={styles.header}
          >
            <Text style={styles.title}>Set up your profile</Text>
            <Text style={styles.sub}>Pick an avatar and tell us your name</Text>
          </Animated.View>

          {/* Selected avatar preview */}
          <Animated.View
            entering={FadeInDown.duration(DURATION.base).delay(80).easing(EASING_OUT_CUBIC)}
            style={styles.previewWrap}
          >
            <View style={[styles.previewCircle, selectedEmoji ? styles.previewActive : null]}>
              <Text style={styles.previewEmoji}>
                {selectedEmoji || '?'}
              </Text>
            </View>
          </Animated.View>

          {/* Name input */}
          <Animated.View
            entering={FadeInDown.duration(DURATION.base).delay(160).easing(EASING_OUT_CUBIC)}
          >
            <TextInput
              style={styles.input}
              placeholder="Your name"
              placeholderTextColor={colors.MUTED}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              autoComplete="given-name"
              maxLength={30}
            />
          </Animated.View>

          {/* Emoji categories */}
          {EMOJI_CATEGORIES.map((cat, ci) => (
            <Animated.View
              key={cat.label}
              entering={FadeInDown.duration(DURATION.base).delay(240 + ci * 80).easing(EASING_OUT_CUBIC)}
              style={styles.catWrap}
            >
              <Text style={styles.catLabel}>{cat.label}</Text>
              <View style={styles.emojiGrid}>
                {cat.emojis.map((emoji) => (
                  <Pressable
                    key={emoji}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                      setSelectedEmoji(emoji);
                    }}
                    style={[
                      styles.emojiCell,
                      selectedEmoji === emoji && styles.emojiSelected,
                    ]}
                  >
                    <Text style={styles.emoji}>{emoji}</Text>
                  </Pressable>
                ))}
              </View>
            </Animated.View>
          ))}

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Continue button */}
        <View style={styles.footer}>
          <APressable
            onPressIn={() => (btnScale.value = withSpring(0.96))}
            onPressOut={() => (btnScale.value = withSpring(1))}
            onPress={handleContinue}
            disabled={!canContinue}
            style={[styles.btn, !canContinue && { opacity: 0.4 }, btnStyle]}
          >
            <Text style={styles.btnText}>Continue</Text>
          </APressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.DARK,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    gap: 8,
  },
  title: {
    color: colors.WHITE,
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
  },
  sub: {
    color: colors.MUTED,
    fontSize: 15,
    textAlign: 'center',
  },
  previewWrap: {
    alignItems: 'center',
    marginBottom: 24,
  },
  previewCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.DARK3,
    borderWidth: 2,
    borderColor: colors.GRAY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewActive: {
    borderColor: colors.LIME,
    backgroundColor: 'rgba(232,255,107,0.08)',
  },
  previewEmoji: {
    fontSize: 44,
  },
  input: {
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: colors.GRAY,
    paddingHorizontal: 20,
    color: colors.WHITE,
    fontSize: 16,
    marginBottom: 28,
  },
  catWrap: {
    marginBottom: 20,
  },
  catLabel: {
    color: colors.MUTED,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.4,
    marginBottom: 10,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  emojiCell: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.DARK3,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  emojiSelected: {
    borderColor: colors.LIME,
    backgroundColor: 'rgba(232,255,107,0.1)',
  },
  emoji: {
    fontSize: 26,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 12,
  },
  btn: {
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.LIME,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    color: colors.DARK,
    fontSize: 17,
    fontWeight: '700',
  },
});
