import React from "react";
import { TouchableOpacity, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "./Themed";
import { useTheme } from "@react-navigation/native";

interface HeaderProps {
  showBackButton?: boolean;
  rightComponent?: React.ReactNode;
  title?: string;
  onBackPress?: () => void;
  backgroundColor?: string;
}

export const Header: React.FC<HeaderProps> = ({
  showBackButton = true,
  rightComponent,
  title,
  onBackPress,
}) => {
  const { colors } = useTheme();
  const router = useRouter();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  return (
    <View style={[styles.header, { backgroundColor: "transparent" }]}>
      <View>
        {showBackButton && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
        )}
      </View>
      {title && (
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        </View>
      )}
      <View style={styles.rightSection}>{rightComponent}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 56,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: 40,
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: 40,
  },
  backButton: {
    padding: 8,
  },
  titleContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
});
