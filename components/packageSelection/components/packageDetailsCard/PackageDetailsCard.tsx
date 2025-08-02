import { TouchableOpacity, View } from "react-native";
import { Checkbox, List, Surface, Text } from "react-native-paper";
import { $styles } from "./styles";

export interface PackageDetailsCardField {
  key: string
  icon: string
  value: string
}

export interface PackageDetailsCardProps {
  fields: PackageDetailsCardField[]
  id: string
  selected: boolean
  price: number
  disabled?: boolean
  onPress: () => void
}

export function PackageDetailsCard(props: PackageDetailsCardProps) {
  const formatPrice = (price: number) => `$${price.toFixed(2)}`;
  return (
    <TouchableOpacity disabled={props.disabled} onPress={props.onPress} className="w-full rounded-3xl bg-[#202939]">
      <Surface elevation={4} style={props.selected ? $styles.cardActive : $styles.card}>
        <View style={$styles.priceContainer}>
          <Checkbox uncheckedColor="#DADADA" color="#32D583" status={props.selected ? "checked" : 'unchecked'} />
          <Text variant="titleLarge" style={$styles.price}>{formatPrice(props.price)}</Text>
        </View>
        {
          props.fields.map(field => (
            <View key={field.key} style={$styles.container}>
              <View style={$styles.left}>
                <List.Icon icon={field.icon} />
                <Text>{field.key}</Text>
              </View>
              <Text>{field.value}</Text>
            </View>
          ))
        }
      </Surface>
    </TouchableOpacity>
  )
}

