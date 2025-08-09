import { View } from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";
import { $styles } from "./styles";

interface PackageListFooterProps {
  isLoading: boolean;
  packageCount: number;
}

export const PackageListFooter = ({
  isLoading,
  packageCount,
}: PackageListFooterProps) => {
  if (isLoading) {
    return (
      <View style={$styles.footerLoader}>
        <ActivityIndicator size="large" color="#32D583" />
        <Text style={{ marginTop: 8, color: "white" }}>
          Loading packages...
        </Text>
      </View>
    );
  }

  if (packageCount > 0) {
    return (
      <View style={$styles.footer}>
        <Text variant="bodySmall" style={{ color: "#666", textAlign: "center" }}>
          {packageCount} package{packageCount !== 1 ? "s" : ""} available
        </Text>
      </View>
    );
  }

  return null;
};


