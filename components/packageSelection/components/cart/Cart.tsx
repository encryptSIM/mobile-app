import { ScrollView, View } from "react-native";
import { Button, FAB, Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { $styles } from "./styles";
import { useThrottledCallback } from "@/hooks/use-throttled-callback";
import { Icon } from "@/components/Icon";

const MEDIUM_FAB_HEIGHT = 40;

export interface CartItem {
  description: string;
  qty: number;
  id: string;
  value: number;
  increment: () => void;
  decrement: () => void;
}

export interface CartProps {
  items: CartItem[];
  loading?: boolean
  onCheckout: () => void;
}

export function Cart(props: CartProps) {
  const { bottom } = useSafeAreaInsets();
  const totalAmount = props.items.reduce((sum, item) => sum + (item.value * item.qty), 0);
  const hasItems = props.items.length > 0 && props.items.some(item => item.qty > 0);
  const throttledCheckout = useThrottledCallback(props.onCheckout, 1000)

  if (!hasItems) return null;

  return (
    <View style={[
      $styles.container,
      {
        paddingBottom: bottom + 16,
        backgroundColor: 'transparent'
      }
    ]}>
      <View style={$styles.cartContent}>
        <ScrollView
          style={$styles.itemsList}
          showsVerticalScrollIndicator={false}
        >
          {props.items
            .filter(item => item.qty > 0)
            .map((item) => (
              <View key={item.id} style={$styles.cartItem}>
                <View style={$styles.itemInfo}>
                  <Text variant="bodyMedium" style={$styles.itemDescription}>
                    {item.description}
                  </Text>
                </View>

                <View style={$styles.quantityControls}>
                  <FAB
                    color="white"
                    mode="flat"
                    size="small"
                    disabled={props.items[0].qty < 2}
                    rippleColor={'white'}
                    icon={
                      () => <View style={$styles.icon}><Icon icon="minus" colour="white" /></View>
                    }
                    onPress={item.decrement}
                    style={[$styles.quantityButton, $styles.minusButton]}
                    customSize={MEDIUM_FAB_HEIGHT}
                  />
                  <Text variant="titleMedium" style={$styles.quantityText}>
                    {item.qty}
                  </Text>
                  <FAB
                    mode="flat"
                    color="white"
                    size="small"
                    rippleColor={'white'}
                    icon={
                      () => <View style={$styles.icon}><Icon icon="plus" colour="white" /></View>
                    }
                    onPress={item.increment}
                    style={[$styles.quantityButton, $styles.plusButton]}
                    customSize={MEDIUM_FAB_HEIGHT}
                  />
                </View>
              </View>
            ))}
        </ScrollView>

        <Button
          mode="contained"
          loading={props.loading}
          disabled={props.loading}
          onPressIn={throttledCheckout}
          style={$styles.checkoutButton}
          labelStyle={$styles.checkoutButtonText}
        >
          Checkout: ${totalAmount.toFixed(2)} USD
        </Button>
      </View>
    </View>
  );
}
