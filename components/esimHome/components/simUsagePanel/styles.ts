import { StyleSheet } from "react-native";

export const $styles = StyleSheet.create({
  root: {
    backgroundColor: "#202939",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    minHeight: 400,
  },
  headerIcons: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 20,
  },
  iconContainer: {
    alignItems: "center",
    padding: 12,
    borderRadius: 50,
    minWidth: 60,
    minHeight: 60,
    justifyContent: "center",
  },
  selectedIconContainer: {
    backgroundColor: "rgba(192, 223, 244, 0.2)",
  },
  iconLabel: {
    color: "#666",
    fontSize: 12,
    marginTop: 4,
    fontWeight: "500",
  },
  selectedIconLabel: {
    color: "white",
  },
  progressContainer: {
    alignItems: "center",
    marginBottom: 16,
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
    fontSize: 30,
    fontWeight: "700",
  },
  progressSubtitle: {
    color: "#DADADA",
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
  topUpButton: {
    borderWidth: 2,
    borderColor: "#32D583",
    borderRadius: 25,
    paddingHorizontal: 32,
    paddingVertical: 12,
    backgroundColor: "transparent",
  },
  topUpButtonText: {
    color: "#32D583",
    fontSize: 16,
    fontWeight: "500",
  },
  installedText: {
    color: "#9CA1AB",
    fontSize: 14,
    fontWeight: "400",
  },
  textButton: {
    paddingTop: 16,
  },
});
