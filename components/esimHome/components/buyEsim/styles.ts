import { brandGreen, card } from "@/components/app-providers";
import { StyleSheet } from "react-native";

export const $styles = StyleSheet.create({
  root: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: card,
    borderRadius: 30,
    marginTop: 16,
    padding: 14,
  },
  image: {
    width: 50,
    height: 50
  },
  button: {
    backgroundColor: brandGreen,
  },
  title: {
    fontWeight: 700,
  },
  text: {
    maxWidth: '70%',
    color: '#CDD0D5',
  },
})
