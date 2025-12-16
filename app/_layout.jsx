import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/use-color-scheme';
import ReduxProvider from '@/store/ReduxProvider';
import { useEffect } from 'react';
import * as Linking from 'expo-linking';
import Header from '@/src/components/header';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BackHandler } from 'react-native';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  useEffect(() => {
    const handleDeepLink = ({ url }) => {
      const parsed = Linking.parse(url);
      const route = parsed.path ?? parsed.hostname;

      console.log('Deep link parsed:', parsed);

      if (
        route === 'verify-email' &&
        parsed.queryParams?.uid &&
        parsed.queryParams?.token
      ) {
        router.push(
          `/verify-email?uid=${parsed.queryParams.uid}&token=${parsed.queryParams.token}`
        );
        return;
      }

      if (
        route === 'reset-password-confirm' &&
        parsed.queryParams?.uid &&
        parsed.queryParams?.token
      ) {
        router.push(
          `/reset-password-confirm?uid=${parsed.queryParams.uid}&token=${parsed.queryParams.token}`
        );
      }
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);

    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    return () => subscription.remove();
  }, []);




  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress",() => {
      if(router.canGoBack()){
        router.back()
        return true
      }
      return false
    })
    return () => sub.remove()
  },[router])



  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ReduxProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack >
          <Stack.Screen 
            name="(tabs)"
            options={{
              header:() => <Header />
            }}
          />
          <Stack.Screen 
            name="modal" 
            options={{ 
              presentation: 'modal', 
              title: 'Modal',
              header:() => <Header />
            }} 
          />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </ReduxProvider>
    </GestureHandlerRootView>
  );
}
