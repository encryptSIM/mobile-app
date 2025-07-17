import "react-native-get-random-values"; // Must be first import for crypto support
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreenAPI from "expo-splash-screen";
import { useEffect, useState } from "react";
import "react-native-reanimated";

import { useColorScheme } from "@/components/useColorScheme";
import { DarkThemeCustom, LightTheme } from "@/constants/custom-theme";
import { useAsyncStorage } from "@/hooks/asyn-storage-hook";
import { useRouter } from "expo-router";
import "../global.css";
import SplashScreen from "./splash-screen";
import { AuthProvider, useAuth } from "@/context/auth-context";
import { createDevice } from "@/service/vpnService";

export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreenAPI.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreenAPI.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { publicKey, loading, deviceToken, setDeviceToken } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (publicKey) {
        router.replace("/(tabs)/esim/package");
      }
    }
  }, [publicKey, loading, router, deviceToken]);

  return (
    <ThemeProvider
      value={colorScheme === "dark" ? DarkThemeCustom : LightTheme}
    >
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="onboarding/index"
          options={{ headerShown: false }}
        />
        <Stack.Screen name="login/index" options={{ headerShown: false }} />
        <Stack.Screen name="login/account" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: "modal" }} />
      </Stack>
    </ThemeProvider>
  );
}
