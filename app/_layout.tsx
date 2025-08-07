import FontAwesome from "@expo/vector-icons/FontAwesome";
import { ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreenAPI from "expo-splash-screen";
import { useEffect, useState } from "react";
import "react-native-reanimated";

import { AppProviders } from "@/components/app-providers";
import { useAuth } from "@/components/auth/auth-provider";
import { DarkThemeCustom } from "@/constants/custom-theme";
import "../global.css";

export { ErrorBoundary } from "expo-router";

SplashScreenAPI.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ ...FontAwesome.font });
  const [splashFinished,] = useState(false);
  const ready = fontsLoaded && splashFinished;

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
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) return null
  return (
    <ThemeProvider
      value={DarkThemeCustom}
    >
      <Stack>
        <Stack.Protected guard={!isAuthenticated}>
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        </Stack.Protected>
        <Stack.Protected guard={isAuthenticated}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="checkoutStack" options={{ headerShown: false }} />
        </Stack.Protected>
      </Stack>
    </ThemeProvider>
  );
}
