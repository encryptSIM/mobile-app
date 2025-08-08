import { StyleSheet } from "react-native";

export const $styles = StyleSheet.create({
  animatedView: {
    marginHorizontal: 16,
    marginVertical: 12,
  },
  card: {
    marginBottom: 20,
    backgroundColor: "#202939",
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#ff4757",
    shadowColor: "#ff4757",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ff475720",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  headerText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ff4757",
    flex: 1,
  },
  errorText: {
    fontSize: 15,
    color: "#ffffff",
    lineHeight: 22,
    marginBottom: 16,
    opacity: 0.9,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  tryAgainButton: {
    backgroundColor: "#ff4757",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    display: "flex",
    justifyContent: "center",
  },
  tryAgainIcon: {
    marginRight: 6,
  },
  tryAgainText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
});
