import { useNavigation } from "expo-router";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function useSafeNavigation() {
  return useNavigation<Nav>();
}

export type RootStackParamList = {
  // Public routes
  onboarding: undefined;
  env: undefined;

  // Authenticated routes
  "(tabs)": undefined;
  checkoutStack: {
    screen: "index" | "checkout" | "addSim";
    params?: {
      title?: string | string[];
      countryCode?: string | string[];
      label?: string | string[];
      region?: string | string[];
    };
  };
};
