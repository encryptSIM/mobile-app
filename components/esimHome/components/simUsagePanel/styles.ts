import { brandGreen, card } from "@/components/app-providers";
import { sizing } from "@/constants/sizing";
import { StyleSheet } from "react-native";

export const $styles = StyleSheet.create({
  root: {
    backgroundColor: card,
    borderRadius: sizing.margin * 1.5,
    padding: sizing.padding,
    alignItems: "center",
    minHeight: sizing.progress * 2,
  },
  headerIcons: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: sizing.margin,
  },
  iconContainer: {
    alignItems: "center",
    padding: sizing.margin / 2,
    borderRadius: 50,
    minWidth: sizing.icon * 2,
    minHeight: sizing.icon * 2,
    justifyContent: "center",
  },
  selectedIconContainer: {
    backgroundColor: "rgba(192, 223, 244, 0.2)",
  },
  iconLabel: {
    color: "#666",
    fontSize: sizing.fontSmall,
    marginTop: sizing.margin / 3,
    fontWeight: "500",
  },
  selectedIconLabel: {
    color: "white",
  },
  progressContainer: {
    alignItems: "center",
    marginBottom: sizing.margin,
  },
  circularProgressWrapper: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  progressTextContainer: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  progressValue: {
    color: "white",
    fontSize: sizing.fontLarge,
    fontWeight: "700",
  },
  progressSubtitle: {
    color: "#DADADA",
    fontSize: sizing.fontSmall,
    marginTop: sizing.margin / 2,
    textAlign: "center",
  },
  topUpButton: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: brandGreen,
    borderRadius: sizing.margin * 1.5,
    paddingHorizontal: sizing.padding * 1.5,
    paddingVertical: sizing.margin / 1.5,
    backgroundColor: "transparent",
    height: sizing.buttonHeight,
  },
  topUpButtonText: {
    color: brandGreen,
    fontSize: sizing.fontMedium,
    fontWeight: "500",
  },
  installedText: {
    color: "#9CA1AB",
    fontSize: sizing.fontSmall,
    fontWeight: "400",
  },
  textButton: {
    paddingTop: sizing.margin,
  },
});
