import React from "react";
import {
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  GestureResponderEvent,
  StyleSheet,
} from "react-native";
import { Feather } from "@expo/vector-icons";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "moonlight"
  | "inactive"
  | "loading"
  | "icon"
  | "slider-login"
  | "slider-signup"
  | "slide";

type Props = {
  label?: string;
  iconName?: keyof typeof Feather.glyphMap;
  onPress?: (event: GestureResponderEvent) => void;
  variant?: ButtonVariant;
  isActive?: boolean;
  showRightArrow?: boolean;
  isDisabled?: boolean;
};

export const AppButton = ({
  label,
  iconName,
  onPress,
  variant = "primary",
  isActive = true,
  showRightArrow = true,
  isDisabled,
}: Props) => {
  const isLoading = variant === "loading";
  const disabled = !isActive || isLoading || isDisabled;

  return (
    <TouchableOpacity
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.buttonBase,
        buttonStyles[variant],
        disabled && styles.disabled,
      ]}
    >
      <View style={styles.contentWrapper}>
        {iconName && (
          <View style={styles.iconContainer}>
            <Feather
              name={iconName}
              size={18}
              color={variant === "inactive" ? "#A678F0" : "#00FFAA"}
            />
          </View>
        )}
        {isLoading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          label && (
            <Text style={[styles.labelBase, labelStyles[variant]]}>
              {label}
            </Text>
          )
        )}
      </View>

      {!isLoading && showRightArrow && variant !== "inactive" && (
        <Feather name="arrow-right" size={20} color="#00FFAA" />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonBase: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 999,
  },
  contentWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4, // This may require patching for older RN versions
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#292F45",
    alignItems: "center",
    justifyContent: "center",
  },
  labelBase: {
    fontSize: 16,
    fontWeight: "600",
  },
  disabled: {
    opacity: 0.5,
  },
});

// Button background + padding styles per variant
const buttonStyles: Record<ButtonVariant, any> = {
  moonlight: {
    backgroundColor: "#1B2034",
    borderColor: "#555",
    borderWidth: 1,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  primary: {
    backgroundColor: "#22C55E",
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  secondary: {
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  inactive: {
    backgroundColor: "#1B2034",
    borderColor: "#555",
    borderWidth: 1,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  loading: {
    backgroundColor: "#22C55E",
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  icon: {
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  "slider-login": {
    backgroundColor: "#22C55E",
    paddingHorizontal: 24,
    paddingVertical: 12,
    flex: 1,
  },
  "slider-signup": {
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 24,
    paddingVertical: 12,
    flex: 1,
  },
  slide: {
    backgroundColor: "#22C55E",
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
};

// Label text color styles per variant
const labelStyles: Record<ButtonVariant, any> = {
  moonlight: { color: "#fff" },
  primary: { color: "#fff" },
  secondary: { color: "#22C55E" },
  inactive: { color: "#fff" },
  loading: { color: "#fff" },
  icon: { color: "#22C55E" },
  "slider-login": { color: "#fff" },
  "slider-signup": { color: "#22C55E" },
  slide: { color: "#fff" },
};
