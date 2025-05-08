// tabs/esim/_layout.tsx
import { Stack } from "expo-router";

export default function EsimLayout() {
  return (
    <Stack initialRouteName="package">
      <Stack.Screen name="package" options={{ headerShown: false }} />
      <Stack.Screen name="order" options={{ headerShown: false }} />
    </Stack>
  );
}
