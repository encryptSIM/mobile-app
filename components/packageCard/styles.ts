import { StyleSheet } from "react-native";

export const $styles = StyleSheet.create({
  root: {
    width: '100%',
    height: 100,
  },
  label: {
    color: 'white',
    paddingTop: 16,
    paddingLeft: 16,
    width: 100,
  },
  container: {
    backgroundColor: "#202939",
    borderRadius: 30,
    width: '100%',
    height: 100,
    position: 'relative',
    overflow: 'hidden'
  },
  flag: {
    width: 70,
    height: 70,
    borderRadius: 50,
  },
  flagWrapper: {
    position: 'absolute',
    right: -5,
    bottom: -5,
    width: 70,
    height: 70,
    borderRadius: 25,
    overflow: 'hidden',
  },
});
