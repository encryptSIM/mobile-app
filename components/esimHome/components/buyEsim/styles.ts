import { StyleSheet } from "react-native";

export const $styles = StyleSheet.create({
  root: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#202939',
    borderRadius: 30,
    marginTop: 16,
    padding: 14,
  },
  image: {
    width: 50,
    height: 50
  },
  button: {
    backgroundColor: "#32D583",
  },
  title: {
    fontWeight: 700,
  },
  text: {
    maxWidth: '70%',
    color: '#CDD0D5',
  },
})
