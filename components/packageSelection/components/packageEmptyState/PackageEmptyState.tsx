import { View } from "react-native";
import { Button, Text } from "react-native-paper";
import { $styles } from "./styles";
import { Icon } from "@/components/Icon";

interface PackageEmptyStateProps {
  onClearFilters: () => void;
}

export const PackageEmptyState = ({ onClearFilters }: PackageEmptyStateProps) => {
  return (
    <View style={$styles.emptyContainer}>
      <Icon size={'large'} icon="cube" />
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
