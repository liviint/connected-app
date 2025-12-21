import { DarkTheme, DefaultTheme } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/use-color-scheme';
import ReduxProvider from '@/store/ReduxProvider';
import { useEffect } from 'react';
import Header from '@/src/components/header';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BackHandler } from 'react-native';
import * as Sentry from '@sentry/react-native';
import ThemeProvider from "../src/components/ThemeProvider"

Sentry.init({
  dsn: 'https://48bbd82038bb8c934670f33b8148b11f@o4510547845382144.ingest.us.sentry.io/4510547919765504',

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Enable Logs
  enableLogs: true,

  // Configure Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration(), Sentry.feedbackIntegration()],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

export const unstable_settings = {
  anchor: '(tabs)',
};

export default Sentry.wrap(function RootLayout() {
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
        <ThemeProvider >
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
});