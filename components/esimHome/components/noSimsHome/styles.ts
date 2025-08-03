import { StyleSheet } from "react-native";

export const $styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 36,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 32,
  },
  logo: {
    width: 48,
    height: 48,
  },
  icon: {
    width: 48,
    height: 48,
  },
  searchSpacing: {
    height: 16,
  },
  tabsContainer: {
    position: "relative",
    zIndex: 1000,
    width: "100%",
    backgroundColor: "#111926",
    paddingTop: 8,
    paddingBottom: 8,
  },
  listContent: {
    paddingBottom: 16,
  },
  columnWrapper: {
    justifyContent: "space-between",
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  cardContainer: {
    flex: 1,
    marginHorizontal: 8,
  },
});



