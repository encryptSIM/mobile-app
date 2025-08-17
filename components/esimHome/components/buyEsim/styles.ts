import { brandGreen, card } from "@/components/app-providers";
import { sizing } from "@/constants/sizing";
import { StyleSheet } from "react-native";

export const $styles = StyleSheet.create({
  root: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: card,
    borderRadius: 30,
    marginTop: sizing.margin,
    padding: sizing.padding,
  },
  left: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: sizing.icon,
  },
  image: {
    width: sizing.icon * 2,
    height: sizing.icon * 2
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
