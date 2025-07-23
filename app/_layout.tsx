import "react-native-get-random-values"; // Must be first import for crypto support
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreenAPI from "expo-splash-screen";
import { useEffect, useState } from "react";
import "react-native-reanimated";

import { AppProviders } from "@/components/app-providers";
import { useAuth } from "@/components/auth/auth-provider";
import { useColorScheme } from "@/components/useColorScheme";
import { DarkThemeCustom, LightTheme } from "@/constants/custom-theme";
import "../global.css";
import SplashScreen from "./splash-screen";

export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreenAPI.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ ...FontAwesome.font });
  const [splashFinished, setSplashFinished] = useState(false);
  const ready = fontsLoaded && splashFinished;

  useEffect(() => {
    if (loaded) {
      SplashScreenAPI.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AppProviders>
      <RootLayoutNav />
    </AppProviders>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { isAuthenticated } = useAuth()
  return (
    <ThemeProvider
      value={colorScheme === "dark" ? DarkThemeCustom : LightTheme}
    >
      <Stack>
        <Stack.Protected guard={!isAuthenticated}>
          <Stack.Screen
            name="onboarding/index"
            options={{ headerShown: false }}
          />
          <Stack.Screen name="login/index" options={{ headerShown: false }} />
          <Stack.Screen name="login/account" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: "modal" }} />
        </Stack.Protected>
        <Stack.Protected guard={isAuthenticated}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack.Protected>
      </Stack>
    </ThemeProvider>
  );
}
