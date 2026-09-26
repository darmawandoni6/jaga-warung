import { useColorScheme } from 'react-native';

import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { DatabaseProvider } from '@/db/DatabaseProvider';
import { SettingsHydrator } from '@/db/SettingsHydrator';

import '../global.css';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <DatabaseProvider>
        <SettingsHydrator>
          <AnimatedSplashOverlay />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(modals)/checkout" options={{ presentation: 'modal', headerShown: false }} />
            <Stack.Screen name="(modals)/add-product" options={{ presentation: 'modal', headerShown: false }} />
            <Stack.Screen name="(modals)/add-debt" options={{ presentation: 'modal', headerShown: false }} />
            <Stack.Screen name="(modals)/settings" options={{ presentation: 'modal', headerShown: false }} />
            <Stack.Screen name="(modals)/transaction-history" options={{ presentation: 'modal', headerShown: false }} />
            <Stack.Screen name="(modals)/report" options={{ presentation: 'modal', headerShown: false }} />
          </Stack>
        </SettingsHydrator>
      </DatabaseProvider>
    </ThemeProvider>
  );
}
