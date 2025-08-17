import { brandGreen, card } from "@/components/app-providers";
import React, { memo } from "react";
import { Icon, IconType } from "@/components/Icon";
import { TouchableOpacity, View } from "react-native";
import { Surface, Text } from "react-native-paper";
import { $styles } from "./styles";
import { AnimatedCheckbox } from "@/components/Checkbox";

export interface PackageDetailsCardField {
  key: string
  icon: IconType
  value: string
}

export interface PackageDetailsCardProps {
  fields: PackageDetailsCardField[]
  id: string
  selected?: boolean
  title?: string
  price?: number
  disabled?: boolean
  onPress: () => void
}


export const PackageDetailsCard = memo(function PackageDetailsCard(
  props: PackageDetailsCardProps
) {
  const formatPrice = (price: number) => `$${price.toFixed(2)}`;

  return (
    <TouchableOpacity
      disabled={props.disabled}
      onPress={props.onPress}
      className={`w-full rounded-3xl bg-[${card}]`}
    >
      <Surface
        elevation={4}
        style={props.selected ? $styles.cardActive : $styles.card}
      >
        <View style={$styles.priceContainer}>
          {props.title && (
            <Text variant="titleLarge" style={$styles.title}>
              {props.title}
            </Text>
          )}
          {props.selected !== undefined && (
            <AnimatedCheckbox
              uncheckedColor="#DADADA"
              color={brandGreen}
              status={props.selected ? "checked" : "unchecked"}
            />
          )}
          {props.price && (
            <Text variant="titleLarge" style={$styles.price}>
              {formatPrice(props.price)}
            </Text>
          )}
        </View>
        {props.fields.map((field) => (
          <View key={field.key} style={$styles.container}>
            <View style={$styles.left}>
              <Icon icon={field.icon} colour="white" />
              <Text>{field.key}</Text>
            </View>
            <Text>{field.value}</Text>
          </View>
        ))}
      </Surface>
    </TouchableOpacity>
  );
});
