// tabs/esim/_layout.tsx
import { Stack } from "expo-router";

export default function ProfileLayout() {
  return (
    <Stack initialRouteName="user-profile">
      <Stack.Screen name="user-profile" options={{ headerShown: false }} />
    </Stack>
  );
}
