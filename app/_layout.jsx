import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/use-color-scheme';
import ReduxProvider from '@/store/ReduxProvider';
import { useEffect } from 'react';
import Header from '@/src/components/header';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BackHandler } from 'react-native';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  // Handle Android hardware back button
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (router.canGoBack()) {
        router.back();
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [router]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ReduxProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            {/* Main Tabs */}
            <Stack.Screen
              name="(tabs)"
              options={{
                header: () => <Header />,
              }}
            />

            {/* Modal screen */}
            <Stack.Screen
              name="modal"
              options={{
                presentation: 'modal',
                title: 'Modal',
                header: () => <Header />,
              }}
            />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </ReduxProvider>
    </GestureHandlerRootView>
  );
}
