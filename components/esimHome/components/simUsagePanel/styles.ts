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
    marginBottom: 40,
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
    backgroundColor: "rgba(20, 213, 131, 0.2)",
  },
  iconLabel: {
    color: "#666",
    fontSize: 12,
    marginTop: 4,
    fontWeight: "500",
  },
  selectedIconLabel: {
    color: "#4CAF50",
  },
  progressContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  circularProgressWrapper: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  circularProgress: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  progressCircle: {
    position: "absolute",
  },
  progressIndicator: {
    position: "absolute",
  },
  progressTextContainer: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  progressValue: {
    color: "white",
    fontSize: 30,
    fontWeight: 700,
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
});
