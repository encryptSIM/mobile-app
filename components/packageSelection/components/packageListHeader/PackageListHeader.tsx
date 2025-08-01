import { router } from "expo-router";
import { TouchableOpacity, View } from "react-native";
import { Icon, Text } from "react-native-paper";
import { PackageFilters } from "../packageFilters";
import { $styles } from "./styles";

interface PackageListHeaderProps {
  title: string;
  selectedFilters: number[];
  packageCount: number;
  isLoading: boolean;
  days: number[]
  onFilterPress: (filter: number) => void;
}

export const PackageListHeader = ({
  title,
  selectedFilters,
  onFilterPress,
  packageCount,
  isLoading,
  days,
}: PackageListHeaderProps) => {
  return (
    <View>
      <TouchableOpacity
        onPress={router.back}
        style={$styles.nav}
      >
        <Icon size={24} source={require("@/assets/back.png")} color="white" />
        <Text variant="titleLarge">{title}</Text>
      </TouchableOpacity>

      <PackageFilters
        days={days}
        selectedFilters={selectedFilters}
        onFilterPress={onFilterPress}
        packageCount={packageCount}
        isLoading={isLoading}
      />

      <Text variant="headlineSmall" style={{ marginBottom: 16 }}>
        Available Plans
      </Text>
    </View>
  );
};
