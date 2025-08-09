import { brandGreen, card } from "@/components/app-providers";
import { StyleSheet } from "react-native";

export const $styles = StyleSheet.create({
  root: {
    backgroundColor: card,
    borderRadius: 24,
    padding: 24,
    display: 'flex',
    justifyContent: 'space-evenly',
    alignItems: "center",
    minHeight: 400,
  },
  topUpButton: {
    borderWidth: 2,
    borderColor: brandGreen,
    borderRadius: 25,
    paddingHorizontal: 32,
    paddingVertical: 12,
    backgroundColor: "transparent",
  },
  installButtonText: {
    color: brandGreen,
    fontSize: 16,
    fontWeight: "500",
  },
  installedText: {
    color: "#9CA1AB",
    fontSize: 14,
    fontWeight: "400",
  },
});
