import { Stack } from 'expo-router';
import { colors } from '../../src/theme/colors';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: 320,
        animationTypeForReplace: 'push',
        contentStyle: { backgroundColor: colors.DARK },
        gestureEnabled: true,
      }}
    />
  );
}
