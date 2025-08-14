import { brandGreen, card } from "@/components/app-providers";
import { StyleSheet } from "react-native";

export const $styles = StyleSheet.create({
  root: {
    backgroundColor: card,
    borderRadius: 24,
    paddingBottom: 16,
    display: 'flex',
    justifyContent: 'space-evenly',
    alignItems: "center",
    minHeight: 400,
  },
  header: {
    alignItems: "center",
    marginBottom: 8,
  },
  headerLogo: {
    width: 36,
    height: 36,
    marginVertical: 16,
  },
  headerTitle: {
    color: "white",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  headerSubtitle: {
    color: "#9CA1AB",
    fontSize: 14,
    fontWeight: "400",
    textAlign: "center",
    marginBottom: 4,
    letterSpacing: 0.1,
  },
  topUpButton: {
    marginBottom: 12,
    borderWidth: 2,
    borderColor: brandGreen,
    borderRadius: 25,
    paddingHorizontal: 32,
    paddingVertical: 12,
    backgroundColor: "transparent",
    marginTop: 16,
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
