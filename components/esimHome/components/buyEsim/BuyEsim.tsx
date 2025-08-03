import { View, Image } from "react-native";
import { $styles } from "./styles";
import { FAB, Text } from "react-native-paper";

export interface BuyEsimProps {
  onBuyPress: () => void
}

export function BuyEsim(props: BuyEsimProps) {
  return (
    <View style={$styles.root}>
      <Image style={$styles.image} source={require("@/assets/buy-esim.png")} />
      <View>
        <Text style={$styles.title} variant="bodyLarge">
          Buy encryptSIM
        </Text>
        <Text style={$styles.text} variant="bodySmall">
          Free dVPN Access on any plan
        </Text>
      </View>
      <FAB
        mode="flat"
        color=""
        size="small"
        rippleColor={'white'}
        icon="arrow-right"
        onPress={props.onBuyPress}
        style={[$styles.button]}
      />
    </View>
  )
}
