import React from 'react';
import { Redirect, Stack } from 'expo-router';
import { colors } from '../../src/theme/colors';
import { useAuthStore } from '../../src/store/authStore';

export default function AppLayout() {
  const session = useAuthStore((s) => s.session);
  const skippedAuth = useAuthStore((s) => s.skippedAuth);

  if (!session && !skippedAuth) {
    return <Redirect href="/onboarding/auth" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.DARK },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="chat" />
      <Stack.Screen name="home" />
      <Stack.Screen
        name="baseline"
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
          gestureEnabled: true,
        }}
      />
      <Stack.Screen
        name="trace"
        options={{
          presentation: 'transparentModal',
          animation: 'fade',
          gestureEnabled: true,
        }}
      />
      <Stack.Screen
        name="paywall"
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
          gestureEnabled: true,
        }}
      />
    </Stack>
  );
}
