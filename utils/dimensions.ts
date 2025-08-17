import { Dimensions, Platform } from "react-native";

export const getDimensions = () => {
  if (Platform.OS === 'web') {
    if (Dimensions.get('window').width < 450)
      return Dimensions.get("window");
    else
      return { width: 381, height: 812 };
  }
  return Dimensions.get("window");
};

