import { useCallback } from "react";
import { FlatList, ListRenderItem, View } from "react-native";
import { Chip, Text } from "react-native-paper";
import { $styles } from "./styles";
import { brandGreen } from "@/components/app-providers";

interface PackageFiltersProps {
  selectedFilters: number[];
  packageCount: number;
  isLoading: boolean;
  days: number[]
  onFilterPress: (filter: number) => void;
}

export const PackageFilters = ({
  selectedFilters,
  onFilterPress,
  days,
}: PackageFiltersProps) => {
  const renderFilterItem: ListRenderItem<number> = useCallback(
    ({ item }) => (
      <Chip
        key={item}
        selected={selectedFilters?.includes(item)}
        selectedColor={brandGreen}
        showSelectedCheck={false}
        style={
          selectedFilters?.includes(item) ? $styles.chipActive : $styles.chip
        }
        onPress={() => onFilterPress(item)}
      >
        <Text>{`${item} ${item > 1 ? 'Days' : 'Day'}`}</Text>
      </Chip>
    ),
    [selectedFilters, onFilterPress]
  );

  return (
    <View>
      <FlatList
        data={days}
        renderItem={renderFilterItem}
        keyExtractor={(item) => String(item)}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={$styles.filterContainer}
        ItemSeparatorComponent={() => <View style={{ width: 8 }} />}
      />
    </View>
  );
};


