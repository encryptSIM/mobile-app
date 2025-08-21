import { background } from "@/components/app-providers";
import { sizing } from "@/constants/sizing";
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
  listHeader: {
    width: '100%',
    height: 16
  },
  header: {
    flexDirection: "row",
    backgroundColor: "transparent",
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
    backgroundColor: background,
    paddingTop: 8,
    paddingBottom: 8,
  },
  body: {
    paddingHorizontal: sizing.horizontalPadding,
    flex: 1,
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



