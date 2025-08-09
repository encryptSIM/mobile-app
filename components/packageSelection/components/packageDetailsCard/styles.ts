import { brandGreen, card } from "@/components/app-providers";
import { StyleSheet } from "react-native";


export const $styles = StyleSheet.create({
  priceContainer: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontWeight: 800
  },

  price: {
    fontWeight: 800
  },

  cardActive: {
    backgroundColor: card,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: brandGreen,
    paddingVertical: 14,
    boxSizing: 'content-box',
    paddingHorizontal: 24,
    display: 'flex',
    gap: 12
  },
  card: {
    backgroundColor: card,
    borderColor: card,
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

