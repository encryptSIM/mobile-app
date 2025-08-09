import { StyleSheet } from "react-native";

export const $styles = StyleSheet.create({
  progress: {
    position: 'relative',
    top: 100,
  },
  splashLogo: {
    width: 120,
    height: 120,
    resizeMode: "contain",
  },
  title: {
    marginTop: 20,
    fontSize: 40,
    color: "white",
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 15,
    color: "white",
    textAlign: "center",
    marginTop: 12,
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  loading: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
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


