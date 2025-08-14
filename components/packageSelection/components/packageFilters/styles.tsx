import { brandGreen } from "@/components/app-providers";
import { StyleSheet } from "react-native";

export const $styles = StyleSheet.create({
  chip: {
    borderColor: "#DADADA",
    borderWidth: 2,
  },
  chipActive: {
    backgroundColor: brandGreen,
    borderColor: "white",
    borderWidth: 2,
  },
  filterContainer: {
    paddingTop: 40,
    paddingBottom: 20,
  },
});

