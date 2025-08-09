import { View } from "react-native";
import { Button, Icon, Text } from "react-native-paper";
import { $styles } from "./styles";

interface PackageEmptyStateProps {
  onClearFilters: () => void;
}

export const PackageEmptyState = ({ onClearFilters }: PackageEmptyStateProps) => {
  return (
    <View style={$styles.emptyContainer}>
      <Icon size={64} source="package-variant" color="#666" />
      <Text variant="headlineSmall" style={$styles.emptyTitle}>
        No packages available
      </Text>
      <Text variant="bodyMedium" style={$styles.emptySubtitle}>
        Try adjusting your filters or pull down to refresh
      </Text>
      <Button
        mode="outlined"
        onPress={onClearFilters}
        style={{ marginTop: 16 }}
      >
        Clear Filters
      </Button>
    </View>
  );
};
