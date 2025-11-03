import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/use-color-scheme';
import ReduxProvider from '@/store/ReduxProvider';
import { useEffect } from 'react';
import * as Linking from 'expo-linking';
import { Alert } from 'react-native';
import Header from '@/components/header';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  useEffect(() => {
    const handleDeepLink = (event) => {
      const data = Linking.parse(event.url);
      if (data.path === 'verify-email' && data.queryParams?.uid && data.queryParams?.token) {
        router.push(`/verify-email?uid=${data.queryParams.uid}&token=${data.queryParams.token}`);
      } else {
        Alert.alert("Deep Link Received", JSON.stringify(data));
      }
    };

    const subscription = Linking.addEventListener("url", handleDeepLink);
    Linking.getInitialURL().then(url => {
      if (url) handleDeepLink({ url });
    });

    return () => subscription.remove();
  }, [router]);

  return (
    <ReduxProvider>
      <Header />
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
