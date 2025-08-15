import { brandGreen, card } from "@/components/app-providers";
import { StyleSheet } from "react-native";

export const $styles = StyleSheet.create({
  root: {
    backgroundColor: card,
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 20,
    display: 'flex',
    justifyContent: 'space-evenly',
    alignItems: "center",
    minHeight: 400,
  },
  header: {
    alignItems: "center",
    marginBottom: 16,
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
    textAlign: "center",
  },
  headerSubtitle: {
    color: "#9CA1AB",
    fontSize: 14,
    fontWeight: "400",
    textAlign: "center",
    marginBottom: 4,
    letterSpacing: 0.1,
  },
  qrContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
  },
  qrWrapper: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    // Add subtle border for better definition
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
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
    minWidth: 200,
    // Add subtle shadow
    shadowColor: brandGreen,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  installButtonText: {
    color: brandGreen,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  markCompleteButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  installedText: {
    color: "#9CA1AB",
    fontSize: 14,
    fontWeight: "400",
    textAlign: "center",
    textDecorationLine: "underline",
    textDecorationColor: "#9CA1AB",
  },
});
