import { Image, TouchableOpacity, View } from "react-native";
import CountryFlag from "react-native-country-flag";
import { $styles } from "./styles";
import { Text } from "react-native-paper";
import { useThrottledCallback } from "@/hooks/use-throttled-callback";

export interface PackageCardProps {
  label: string;
  onPress: () => void;
  countryCode?: string;
  imageUri?: string;
}

export function PackageCard(props: PackageCardProps) {
  const throttledPress = useThrottledCallback(props.onPress, 1000)
  return (
    <TouchableOpacity onPress={throttledPress} style={$styles.root}>
      <View style={$styles.container}>
        <View style={$styles.label}>
          <Text>{props.label}</Text>
        </View>
        <View style={$styles.flagWrapper}>
          {props.countryCode ? (
            <CountryFlag
              style={$styles.flag}
              isoCode={props.countryCode}
              size={50}
            />
          ) : (
            <Image
              source={{ uri: props.imageUri }}
              style={$styles.flag}
            />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}
