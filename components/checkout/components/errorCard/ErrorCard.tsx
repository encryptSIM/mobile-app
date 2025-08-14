import { useEffect, useRef } from "react";
import { Animated, Text, TouchableOpacity, View } from "react-native";
import { PaymentState } from "../../hooks/useCheckout";
import { Ionicons } from "@expo/vector-icons";
import { $styles } from "./styles";

export interface ErrorCardProps {
  paymentState: PaymentState;
  clearError: () => void;
}
export function ErrorCard({ paymentState, clearError }: ErrorCardProps) {
  if (!paymentState.error) return null;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    if (paymentState.error) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [paymentState.error]);

  return (
    <View style={$styles.card}>
      <View style={$styles.headerRow}>
        <View style={$styles.iconCircle}>
          <Ionicons name="alert-circle" size={24} color="#ff4757" />
        </View>
        <Text style={$styles.headerText}>Payment Failed</Text>
      </View>

      <Text style={$styles.errorText}>{paymentState.error}</Text>

      <View style={$styles.buttonRow}>
        <TouchableOpacity
          onPress={clearError}
          style={$styles.tryAgainButton}
        >
          <Ionicons
            name="refresh"
            size={16}
            color="#ffffff"
            style={$styles.tryAgainIcon}
          />
          <Text style={$styles.tryAgainText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
