import CountryFlag from "react-native-country-flag";
import { Text } from "../Themed";
import { $styles } from "./styles";
import { Image, TouchableOpacity, View } from "react-native";

export interface PackageCardProps {
  label: string;
  onPress: () => void;
  countryCode?: string;
  imageUri?: string;
}

export function PackageCard(props: PackageCardProps) {
  return (
    <TouchableOpacity onPress={props.onPress} style={$styles.root}>
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
