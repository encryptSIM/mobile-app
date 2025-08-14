import { StyleSheet } from "react-native";

export const $styles = StyleSheet.create({
  root: {
    width: '100%',
    height: '100%',
  },
  subtitle: {
    color: '#999',
    fontSize: 14,
  },
  header: {
    width: '100%',
    backgroundColor: 'transparent',
    elevation: 0,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  text: {
    marginBottom: 16
  },
  listHeader: {
    marginHorizontal: 16,
  },
  listContainer: {
    display: 'flex',
    paddingHorizontal: 20,
    flex: 1,
    paddingBottom: 20,
    height: '10%',
  },
});


