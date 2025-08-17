import { brandGreen, card } from "@/components/app-providers";
import { sizing } from "@/constants/sizing";
import { StyleSheet } from "react-native";

export const $styles = StyleSheet.create({
  root: {
    backgroundColor: card,
    borderRadius: sizing.margin * 1.5,
    paddingVertical: sizing.padding,
    paddingHorizontal: sizing.padding,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: sizing.progress * 2,
  },
  header: {
    alignItems: "center",
    marginBottom: sizing.margin,
  },
  headerLogo: {
    width: sizing.icon,
    height: sizing.icon,
    marginVertical: sizing.margin,
  },
  headerTitle: {
    color: "white",
    fontSize: sizing.fontLarge,
    fontWeight: "700",
    marginBottom: sizing.margin / 2,
    textAlign: "center",
  },
  headerSubtitle: {
    color: "#9CA1AB",
    fontSize: sizing.fontSmall,
    fontWeight: "400",
    textAlign: "center",
    marginBottom: sizing.margin / 2,
  },
  qrContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: sizing.margin,
  },
  topUpButton: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: sizing.margin,
    borderWidth: 2,
    borderColor: brandGreen,
    borderRadius: sizing.margin * 1.5,
    paddingHorizontal: sizing.padding * 1.5,
    paddingVertical: sizing.margin / 1.5,
    backgroundColor: "transparent",
    marginTop: sizing.margin,
    minWidth: sizing.qr,
    height: sizing.buttonHeight,
    shadowColor: brandGreen,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  installButtonText: {
    color: brandGreen,
    fontSize: sizing.fontMedium,
    fontWeight: "600",
    textAlign: "center",
  },
  markCompleteButton: {
    paddingVertical: sizing.margin / 2,
    paddingHorizontal: sizing.margin,
    borderRadius: sizing.margin,
    backgroundColor: "transparent",
  },
  installedText: {
    color: "#9CA1AB",
    fontSize: sizing.fontSmall,
    fontWeight: "400",
    textAlign: "center",
    textDecorationLine: "underline",
    textDecorationColor: "#9CA1AB",
  },
});
