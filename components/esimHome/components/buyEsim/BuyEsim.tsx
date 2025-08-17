import { useThrottledCallback } from "@/hooks/use-throttled-callback";
import { Image, View } from "react-native";
import { FAB, Text } from "react-native-paper";
import { $styles } from "./styles";
import { Icon } from "@/components/Icon";

export interface BuyEsimProps {
  onBuyPress: () => void
}

export function BuyEsim(props: BuyEsimProps) {
  const debouncedPress = useThrottledCallback(props.onBuyPress, 1000);
  return (
    <View style={$styles.root}>
      <View style={$styles.left}>
        <Image style={$styles.image} source={require("@/assets/buy-esim.png")} />
        <View>
          <Text style={$styles.title} variant="bodyLarge">
            Buy encryptSIM
          </Text>
          <Text style={$styles.text} variant="bodySmall">
            Free dVPN Access on any plan
          </Text>
        </View>
      </View>
      <FAB
        mode="flat"
        color=""
        size="small"
        rippleColor={'white'}
        icon={
          () => <View style={$styles.icon}><Icon icon="right" colour="white" /></View>
        }
        onPress={debouncedPress}
        style={[$styles.button]}
      />
    </View>
  )
}
