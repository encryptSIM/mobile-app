import { StyleSheet } from "react-native";


export const $styles = StyleSheet.create({
  priceContainer: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontWeight: 800
  },

  cardActive: {
    backgroundColor: '#202939',
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#32D583',
    paddingVertical: 14,
    boxSizing: 'content-box',
    paddingHorizontal: 24,
    display: 'flex',
    gap: 12
  },
  card: {
    backgroundColor: '#202939',
    borderColor: '#202939',
    boxSizing: 'content-box',
    borderRadius: 30,
    borderWidth: 2,
    paddingVertical: 14,
    paddingHorizontal: 24,
    display: 'flex',
    gap: 12
  },
  container: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 5,
  },
  item: {
    padding: 0,
    margin: 0,
    backgroundColor: 'red',
    borderStyle: 'solid',
    borderWidth: 2,
    borderColor: 'white',
  },
  left: {
    display: 'flex',
    flexDirection: 'row',
    gap: 5,
  },
});

