import { sizing } from "@/constants/sizing";
import { StyleSheet } from "react-native";

export const $styles = StyleSheet.create({
  root: {
    width: '100%',
    height: '100%',
  },
  header: {
    width: '100%',
    backgroundColor: 'transparent',
    elevation: 0,
  },
  text: {
    marginBottom: 16
  },
  listHeader: {
    marginHorizontal: 16,
  },
  listContainer: {
    display: 'flex',
    paddingHorizontal: sizing.horizontalPadding2,
    flex: 1,
    paddingBottom: 20,
    height: '10%',
  },
});


