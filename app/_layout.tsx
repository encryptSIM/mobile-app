import '../polyfill'
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreenAPI from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";

import { AppProviders } from "@/components/app-providers";
import { DarkThemeCustom } from "@/constants/custom-theme";
import "../global.css";
import { useWalletAuth } from '@/components/auth/wallet-auth-provider';
import { useAuthorization } from '@/components/auth/useAuthorization';

if (process.env.EXPO_PUBLIC_ENVIRONMENT === "prod") {
  console.log = () => { };
  console.debug = () => { };
  console.info = () => { };
  console.warn = () => { };
  console.error = () => { };
}

export { ErrorBoundary } from "expo-router";

SplashScreenAPI.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ ...FontAwesome.font });
  const ready = fontsLoaded;

  useEffect(() => {
    if (ready) {
      SplashScreenAPI.hideAsync();
    }
  }, [ready]);

  return (
    <AppProviders>
      <RootLayoutNav />
    </AppProviders>
  );
}

function RootLayoutNav() {
  // const { isConnected, isLoading } = useWalletAuth();
  const auth = useAuthorization()

  if (auth.isLoading) {
    return null; // keep splash screen visible until wallet state is resolved
  }

  return (
    <ThemeProvider value={DarkThemeCustom}>
      <Stack>
        <Stack.Protected guard={!auth.accounts}>
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        </Stack.Protected>
        <Stack.Protected guard={!!auth?.accounts}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="checkoutStack" options={{ headerShown: false }} />
        </Stack.Protected>
      </Stack>
    </ThemeProvider>
  );
}
