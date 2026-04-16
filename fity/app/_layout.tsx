import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { colors } from '../src/theme/colors';

export default function RootLayout() {
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
