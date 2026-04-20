import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AppState, View } from 'react-native';
import { colors } from '../src/theme/colors';
import { useAuthStore } from '../src/store/authStore';
import { onboardingApi } from '../src/services/api';
import { supabase } from '../src/services/supabase';

export default function RootLayout() {
  const initialized = useAuthStore((s) => s.initialized);

  useEffect(() => {
    const boot = async () => {
      await useAuthStore.getState().initialize();

      // If user has an active session, load their profile
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        try {
          const { user } = await onboardingApi.getMe();
          if (user) {
            useAuthStore.getState().setProfile(user);
            useAuthStore.getState().setIsNewUser(!user.display_name);
          }
        } catch {
          // Non-critical
        }
      }
    };
    boot();

    // Refresh token when app comes to foreground
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        supabase.auth.startAutoRefresh();
      } else {
        supabase.auth.stopAutoRefresh();
      }
    });
    return () => sub.remove();
  }, []);

  if (!initialized) {
    return <View style={{ flex: 1, backgroundColor: colors.DARK }} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.DARK }}>
      <SafeAreaProvider>
        <View style={{ flex: 1, backgroundColor: colors.DARK }}>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.DARK },
              animation: 'slide_from_right',
            }}
          />
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
