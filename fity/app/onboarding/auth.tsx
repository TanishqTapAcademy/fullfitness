import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { ScreenShell } from '../../src/components/ScreenShell';
import { AppleIcon, GoogleIcon, LockIcon } from '../../src/components/icons';
import { colors } from '../../src/theme/colors';
import { useAuthStore } from '../../src/store/authStore';
import { onboardingApi } from '../../src/services/api';
import { getOrCreateDeviceId } from '../../src/services/userId';

const APressable = Animated.createAnimatedComponent(Pressable);

const AuthButton: React.FC<{
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  dark?: boolean;
  disabled?: boolean;
}> = ({ icon, label, onPress, dark, disabled }) => {
  const scale = useSharedValue(1);
  const s = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <APressable
      onPressIn={() => (scale.value = withSpring(0.97))}
      onPressOut={() => (scale.value = withSpring(1))}
      onPress={() => {
        if (disabled) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        onPress();
      }}
      style={[
        styles.authBtn,
        { backgroundColor: dark ? colors.DARK : colors.WHITE, borderColor: dark ? colors.GRAY : colors.WHITE },
        disabled && { opacity: 0.5 },
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
  const { signInWithEmail, signUpWithEmail, signInWithApple, signInWithGoogle, skipAuth, loading, setIsNewUser, setProfile } =
    useAuthStore();

  const [showEmail, setShowEmail] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(true);

  const syncAndProceed = async () => {
    // Navigate to profile immediately — don't block on the API call.
    // The sync runs concurrently; if user turns out to be existing,
    // we redirect to Home from profile via store check.
    router.push('/onboarding/profile');

    // Fire-and-forget sync in background
    getOrCreateDeviceId()
      .then((deviceId) => onboardingApi.syncUser(deviceId))
      .then((result) => {
        if (result.user) setProfile(result.user);
        if (result.is_new_user === false) {
          setIsNewUser(false);
        } else {
          setIsNewUser(true);
        }
      })
      .catch(() => {
        // Sync failed — stay on profile (treat as new)
        setIsNewUser(true);
      });
  };

  const handleEmail = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing fields', 'Please enter your email and password.');
      return;
    }
    const { error } = isSignUp
      ? await signUpWithEmail(email.trim(), password)
      : await signInWithEmail(email.trim(), password);

    if (error) {
      Alert.alert('Auth Error', error);
      return;
    }
    await syncAndProceed();
  };

  const handleApple = async () => {
    const { error } = await signInWithApple();
    if (error) {
      Alert.alert('Auth Error', error);
      return;
    }
    await syncAndProceed();
  };

  const handleGoogle = async () => {
    const { error } = await signInWithGoogle();
    if (error) {
      Alert.alert('Auth Error', error);
      return;
    }
    await syncAndProceed();
  };

  const handleSkip = () => {
    skipAuth();
    router.push('/onboarding/notifications');
  };

  return (
    <ScreenShell step={6}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.top}>
          <View style={styles.lockBadge}>
            <LockIcon size={22} color={colors.LIME} />
          </View>
          <Text style={styles.title}>Don't lose your program</Text>
          <Text style={styles.sub}>
            You just built a personalized plan. Keep it safe.
          </Text>
        </View>

        {loading && (
          <ActivityIndicator size="small" color={colors.LIME} style={{ marginBottom: 16 }} />
        )}

        <View style={styles.authRow}>
          {Platform.OS === 'ios' && (
            <AuthButton
              icon={<AppleIcon size={20} />}
              label="Continue with Apple"
              onPress={handleApple}
              dark
              disabled={loading}
            />
          )}
          <AuthButton
            icon={<GoogleIcon size={20} />}
            label="Continue with Google"
            onPress={handleGoogle}
            disabled={loading}
          />
        </View>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        {!showEmail ? (
          <Pressable
            onPress={() => setShowEmail(true)}
            style={[styles.authBtn, { borderColor: colors.GRAY }]}
          >
            <Text style={[styles.authLabel, { color: colors.WHITE }]}>Continue with Email</Text>
          </Pressable>
        ) : (
          <View style={styles.emailForm}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={colors.MUTED}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={colors.MUTED}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete={isSignUp ? 'new-password' : 'password'}
            />
            <Pressable
              onPress={handleEmail}
              disabled={loading}
              style={[styles.emailSubmit, loading && { opacity: 0.5 }]}
            >
              <Text style={styles.emailSubmitText}>
                {isSignUp ? 'Create Account' : 'Sign In'}
              </Text>
            </Pressable>
            <Pressable onPress={() => setIsSignUp(!isSignUp)}>
              <Text style={styles.toggleText}>
                {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
              </Text>
            </Pressable>
          </View>
        )}

        <Pressable onPress={handleSkip} style={styles.skip} hitSlop={12}>
          <Text style={styles.skipText}>Skip for now</Text>
        </Pressable>

        <Text style={styles.fine}>We never post, share, or sell your data.</Text>
      </KeyboardAvoidingView>
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
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 20, gap: 12 },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.1)' },
  dividerText: { color: colors.MUTED, fontSize: 13 },
  emailForm: { gap: 12 },
  input: {
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: colors.GRAY,
    paddingHorizontal: 20,
    color: colors.WHITE,
    fontSize: 15,
  },
  emailSubmit: {
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.LIME,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emailSubmitText: { color: colors.DARK, fontSize: 16, fontWeight: '700' },
  toggleText: { color: colors.MUTED, fontSize: 13, textAlign: 'center', marginTop: 4 },
  skip: { padding: 16, alignSelf: 'center', marginTop: 20 },
  skipText: { color: colors.MUTED, fontSize: 15, fontWeight: '600', textDecorationLine: 'underline' },
  fine: { color: colors.MUTED, fontSize: 12, textAlign: 'center', marginTop: 'auto' },
});
