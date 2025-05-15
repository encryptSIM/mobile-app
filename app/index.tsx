import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkOnboarding = async () => {
      const onboarded = await SecureStore.getItemAsync("hasOnboarded");
      if (onboarded === "true") {
        router.replace("/(tabs)/esim/package");
      } else {
        router.replace("/onboarding");
      }
    };

    checkOnboarding().finally(() => setChecking(false));
  }, []);

  if (checking) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return null;
}
