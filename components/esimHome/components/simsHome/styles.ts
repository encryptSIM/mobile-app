import { background } from "@/components/app-providers";
import { sizing } from "@/constants/sizing";
import { StyleSheet } from "react-native";

export const $styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: sizing.padding,
    paddingHorizontal: sizing.padding,
    width: "98%",
    alignSelf: 'center',
    height: "100%",
  },
  content: {
    paddingHorizontal: sizing.horizontalPadding,
    display: 'flex',

    justifyContent: 'space-evenly',
    flex: 1,
    width: "100%",
  },
  body: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: sizing.margin,
  },
  logo: {
    width: sizing.logo,
    height: sizing.logo,
    resizeMode: "contain",
  },
  icon: {
    width: sizing.icon,
    height: sizing.icon,
  },
  searchSpacing: {
    height: sizing.margin,
  },
  tabsContainer: {
    position: "relative",
    zIndex: 1000,
    width: "100%",
    backgroundColor: background,
    paddingTop: sizing.margin / 2,
    paddingBottom: sizing.margin / 2,
  },
  listContent: {
    paddingBottom: sizing.margin,
  },
  columnWrapper: {
    justifyContent: "space-between",
    paddingHorizontal: sizing.margin / 2,
    marginBottom: sizing.margin,
  },
  cardContainer: {
    flex: 1,
    marginHorizontal: sizing.margin / 2,
  },
});
