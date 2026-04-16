import React from 'react';
import { Stack } from 'expo-router';
import { colors } from '../../src/theme/colors';

/**
 * Post-onboarding shell. Flat Stack — no bottom tab bar.
 *   - home   → default entry after baseline
 *   - chat   → fullscreen coach (hosts the Trace corner button)
 *   - baseline → modal sheet
 *   - trace    → transparent modal, reachable only from chat
 */
export default function AppLayout() {
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
    </Stack>
  );
}
