import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { ScreenShell } from '../../src/components/ScreenShell';
import { AppleIcon, GoogleIcon, LockIcon } from '../../src/components/icons';
import { colors } from '../../src/theme/colors';

const APressable = Animated.createAnimatedComponent(Pressable);

const AuthButton: React.FC<{
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  dark?: boolean;
}> = ({ icon, label, onPress, dark }) => {
  const scale = useSharedValue(1);
  const s = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <APressable
      onPressIn={() => (scale.value = withSpring(0.97))}
      onPressOut={() => (scale.value = withSpring(1))}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        onPress();
      }}
      style={[
        styles.authBtn,
        { backgroundColor: dark ? colors.DARK : colors.WHITE, borderColor: dark ? colors.GRAY : colors.WHITE },
        s,
      ]}
    >
      {icon}
      <Text style={[styles.authLabel, { color: dark ? colors.WHITE : colors.DARK }]}>{label}</Text>
    </APressable>
  );
};

export default function Auth() {
  const router = useRouter();
  const next = () => router.push('/onboarding/notifications');

  return (
    <ScreenShell step={6}>
      <View style={styles.top}>
        <View style={styles.lockBadge}>
          <LockIcon size={22} color={colors.LIME} />
        </View>
        <Text style={styles.title}>Don't lose your program</Text>
        <Text style={styles.sub}>
          You just built a personalized plan. Keep it safe.
        </Text>
      </View>

      <View style={styles.authRow}>
        <AuthButton icon={<AppleIcon size={20} />} label="Continue with Apple" onPress={next} dark />
        <AuthButton icon={<GoogleIcon size={20} />} label="Continue with Google" onPress={next} />
      </View>

      <Pressable onPress={next} style={styles.skip} hitSlop={12}>
        <Text style={styles.skipText}>Skip for now</Text>
      </Pressable>

      <Text style={styles.fine}>We never post, share, or sell your data.</Text>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  top: { alignItems: 'center', marginTop: 30, marginBottom: 36, gap: 14 },
  lockBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(232,255,107,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(232,255,107,0.3)',
  },
  title: { color: colors.WHITE, fontSize: 26, fontWeight: '800', textAlign: 'center' },
  sub: { color: colors.MUTED, fontSize: 15, textAlign: 'center', paddingHorizontal: 20, lineHeight: 21 },
  authRow: { gap: 12 },
  authBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    minHeight: 56,
    borderRadius: 28,
    borderWidth: 1,
    paddingHorizontal: 20,
  },
  authLabel: { fontSize: 16, fontWeight: '700' },
  skip: { padding: 16, alignSelf: 'center', marginTop: 20 },
  skipText: { color: colors.MUTED, fontSize: 15, fontWeight: '600', textDecorationLine: 'underline' },
  fine: { color: colors.MUTED, fontSize: 12, textAlign: 'center', marginTop: 'auto' },
});
