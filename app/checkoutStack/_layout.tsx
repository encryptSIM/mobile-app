import { Stack } from "expo-router";
import { useEffect } from "react";


export { ErrorBoundary } from "expo-router";



export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="checkout" options={{ headerShown: false }} />
      <Stack.Screen name="addSim" options={{ headerShown: false }} />
    </Stack>
  )
}
