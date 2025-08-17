import React, { useEffect, useRef } from "react";
import {
  TouchableOpacity,
  View,
  StyleSheet,
  Animated,
  Easing,
} from "react-native";
import { Icon } from "./Icon";

interface AnimatedCheckboxProps {
  status: "checked" | "unchecked";
  color?: string;
  uncheckedColor?: string;
  onPress?: () => void;
  disabled?: boolean;
  size?: number;
}

export const AnimatedCheckbox: React.FC<AnimatedCheckboxProps> = ({
  status,
  color = "#4CAF50",
  uncheckedColor = "#DADADA",
  onPress,
  disabled = false,
  size = 24,
}) => {
  const progress = useRef(new Animated.Value(status === "checked" ? 1 : 0))
    .current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: status === "checked" ? 1 : 0,
      duration: 200,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [status]);

  const scale = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1],
  });

  const opacity = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      style={{ width: size, height: size }}
    >
      <View
        style={[
          styles.box,
          {
            borderColor: status === "checked" ? color : uncheckedColor,
            backgroundColor: status === "checked" ? color : "transparent",
            width: size,
            height: size,
            borderRadius: 4,
          },
        ]}
      >
        <Animated.View
          style={{
            transform: [{ scale }],
            opacity,
          }}
        >
          <Icon icon="check" size="small" colour="#fff" />
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  box: {
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
});
