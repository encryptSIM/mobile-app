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
  initialRouteName: "(tabs)/esim/package",
};

SplashScreenAPI.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({ ...FontAwesome.font });
  const [splashFinished, setSplashFinished] = useState(false);

  const ready = fontsLoaded && splashFinished;

  useEffect(() => {
    if (ready) {
      SplashScreenAPI.hideAsync();
    }
  }, [ready]);

  if (!ready) {
    return <SplashScreen onFinish={() => setSplashFinished(true)} />;
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
