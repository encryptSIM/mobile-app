import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreenAPI from "expo-splash-screen";
import { useEffect, useState } from "react";
import "react-native-reanimated";

import { useColorScheme } from "@/components/useColorScheme";
import SplashScreen from "./splash-screen";
import { useAsyncStorage } from "@/hooks/asyn-storage-hook";
import { useRouter } from "expo-router";

export { ErrorBoundary } from "expo-router";
import "../global.css";

export const unstable_settings = {
  initialRouteName: "(tabs)/esim/package",
};

SplashScreenAPI.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded && splashDone) {
      SplashScreenAPI.hideAsync();
    }
  }, [loaded, splashDone]);

  if (!loaded || !splashDone) {
    return <SplashScreen onFinish={() => setSplashDone(true)} />;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { value: storedPublicKey, loading: storageLoading } =
    useAsyncStorage<string>("publicKey");
  const router = useRouter();

  useEffect(() => {
    if (!storageLoading) {
      if (storedPublicKey) {
        router.replace("/(tabs)/esim/package");
      }
    }
  }, [storedPublicKey, storageLoading, router]);

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
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
