import React from "react";
import {
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  GestureResponderEvent,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils";

// Button style variants
const buttonVariants = cva(
  "flex-row items-center justify-between rounded-full",
  {
    variants: {
      variant: {
        primary: "bg-green-500 px-6 py-3",
        secondary: "bg-green-100 px-6 py-3",
        inactive: "bg-[#1B2034] border border-[#555] px-6 py-3",
        loading: "bg-green-500 px-6 py-3",
        icon: "bg-green-100 px-6 py-3",
        "slider-login": "bg-green-500 px-6 py-3 flex-1",
        "slider-signup": "bg-green-100 px-6 py-3 flex-1",
        slide: "bg-green-500 px-6 py-3",
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  }
);

// Label style variants
const labelVariants = cva("text-base font-semibold", {
  variants: {
    variant: {
      primary: "text-white",
      secondary: "text-green-500",
      inactive: "text-white",
      loading: "text-white",
      icon: "text-green-500",
      "slider-login": "text-white",
      "slider-signup": "text-green-500",
      slide: "text-white",
    },
  },
  defaultVariants: {
    variant: "primary",
  },
});

type ButtonVariant = VariantProps<typeof buttonVariants>["variant"];

type Props = {
  label?: string;
  iconName?: keyof typeof Feather.glyphMap;
  onPress?: (event: GestureResponderEvent) => void;
  variant?: ButtonVariant;
  isActive?: boolean;
  showRightArrow?: boolean;
  background?: boolean;
};

export const AppButton = ({
  label,
  iconName,
  onPress,
  variant = "primary",
  isActive = true,
  showRightArrow = true,
}: Props) => {
  const isLoading = variant === "loading";

  return (
    <TouchableOpacity
      disabled={!isActive || isLoading}
      onPress={onPress}
      className={cn(buttonVariants({ variant }), !isActive && "opacity-50")}
    >
      <View style={{ gap: 4 }} className="flex-row items-center">
        {iconName && (
          <View className="w-8 h-8 rounded-full bg-[#292F45] items-center justify-center">
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
            <Text className={cn(labelVariants({ variant }))}>{label}</Text>
          )
        )}
      </View>

      {/* Right arrow */}
      {!isLoading && showRightArrow && variant !== "inactive" && (
        <Feather name="arrow-right" size={20} color="#00FFAA" />
      )}
    </TouchableOpacity>
  );
};
