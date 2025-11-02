import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/use-color-scheme';
import ReduxProvider from '@/store/ReduxProvider';
import { useEffect } from 'react';
import * as Linking from 'expo-linking';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  useEffect(() => {
    const handleDeepLink = (event) => {
      const data = Linking.parse(event.url);
      console.log("Deep link data:", data);

      // Example: handle email verification link
      if (data.path === 'verify-email' && data.queryParams?.uid && data.queryParams?.token) {
        // Navigate to your verify screen with uid and token
        router.push(`/verify-email?uid=${data.queryParams.uid}&token=${data.queryParams.token}`);
      } else {
        Alert.alert("Deep Link Received", JSON.stringify(data));
      }
    };

    // Listen to links while the app is open
    const subscription = Linking.addEventListener("url", handleDeepLink);

    // Handle initial launch link (cold start)
    Linking.getInitialURL().then(url => {
      if (url) handleDeepLink({ url });
    });

    return () => subscription.remove();
  }, [router]);

  return (
    <ReduxProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </ReduxProvider>
  );
}
