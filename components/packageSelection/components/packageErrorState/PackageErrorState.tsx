import { View } from "react-native";
import { Button, Icon, Text } from "react-native-paper";
import { $styles } from "./styles";

interface PackageErrorStateProps {
  onRetry: () => void;
}

export const PackageErrorState = ({ onRetry }: PackageErrorStateProps) => {
  return (
    <View style={$styles.errorContainer}>
      <Icon size={64} source="alert-circle" color="#ff6b6b" />
      <Text variant="headlineSmall" style={$styles.errorTitle}>
        Something went wrong
      </Text>
      <Text variant="bodyMedium" style={$styles.errorSubtitle}>
        Unable to load packages. Please try again.
      </Text>
      <Button mode="contained" onPress={onRetry} style={{ marginTop: 16 }}>
        Retry
      </Button>
    </View>
  );
};
