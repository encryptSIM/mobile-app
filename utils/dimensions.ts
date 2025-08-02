import { Dimensions, Platform } from "react-native";

export const getDimensions = () => {
  if (Platform.OS === 'web') {
    return { width: 375, height: 812 };
  }
  return Dimensions.get("window");
};

