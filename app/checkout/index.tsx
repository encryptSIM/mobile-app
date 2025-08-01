import { PackageDetailsCard, PackageListHeader, PackageEmptyState, PackageListFooter, PackageErrorState, Cart } from "@/components/packageSelection/components";
import { usePackageData, PackageItem } from "@/components/packageSelection/hooks";
import { useLocalSearchParams } from "expo-router";
import { useCallback } from "react";
import {
  FlatList,
  ListRenderItem,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const MAX_PACKAGES = 1
export default function CheckoutScreen() {
  const local = useLocalSearchParams();

  const {
    filteredPackages,
    selectedPackages,
    filter,
    refreshing,
    isLoading,
    isError,
    selectedPackageQtyMap,
    packageDetails,
    filters,
    handlePackagePress,
    handleFilterPress,
    clearFilters,
    onRefresh,
    setSeletedPackageQtyMap,
  } = usePackageData({
    countryCode: local.countryCode ? local.countryCode.toString().toUpperCase() : undefined,
    region: String(local.region)
  });

  const renderPackageItem: ListRenderItem<PackageItem> = useCallback(
    ({ item }) => (
      <PackageDetailsCard
        disabled={selectedPackages.length >= MAX_PACKAGES && !selectedPackages.includes(item.id)}
        price={item.price}
        id={item.id}
        fields={item.packageDetails}
        selected={selectedPackages.includes(item.id)}
        onPress={() => handlePackagePress(item.id)}
      />
    ),
    [selectedPackages, handlePackagePress]
  );

  const renderHeader = useCallback(
    () => (
      <PackageListHeader
        days={filters}
        title={local.label as string}
        selectedFilters={filter}
        onFilterPress={handleFilterPress}
        packageCount={filteredPackages.length}
        isLoading={isLoading}
      />
    ),
    [local.label, filter, handleFilterPress, filteredPackages.length, isLoading]
  );

  const renderEmpty = useCallback(
    () => !isLoading ? <PackageEmptyState onClearFilters={clearFilters} /> : null,
    [isLoading, clearFilters]
  );

  const renderFooter = useCallback(
    () => (
      <PackageListFooter
        isLoading={isLoading}
        packageCount={packageDetails.packageDetails.length}
      />
    ),
    [isLoading, filteredPackages.length]
  );

  if (isError) {
    return (
      <SafeAreaView className="h-full w-full px-5 bg-[#111926]">
        <PackageErrorState onRetry={onRefresh} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="h-full w-full bg-[#111926]">
      <FlatList
        data={filteredPackages}
        renderItem={renderPackageItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={selectedPackages.length < 1 ? renderFooter : null}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#32D583"]}
            tintColor="#32D583"
          />
        }
        contentContainerStyle={$styles.listContainer}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />

      <View style={{ height: 150 * selectedPackages.length }} />
      <Cart
        items={filteredPackages.filter(t => selectedPackages.includes(t.id)).map(selectedPackage => ({
          description: String(selectedPackage.localPackage?.title),
          value: selectedPackage.price,
          qty: selectedPackageQtyMap[selectedPackage.id],
          id: selectedPackage.id,
          increment: () => {
            console.log(selectedPackage.id)
            console.log(selectedPackageQtyMap)
            setSeletedPackageQtyMap(prev => ({
              ...prev,
              [selectedPackage.id]: prev[selectedPackage.id] ? prev[selectedPackage.id] + 1 : 1
            }))
          },
          decrement: () => {
            setSeletedPackageQtyMap(prev => ({
              ...prev,
              [selectedPackage.id]: prev[selectedPackage.id] ? prev[selectedPackage.id] - 1 : 1
            }))
          },
        }))}
        onCheckout={() => { }}
      />
    </SafeAreaView>
  );
}

const $styles = StyleSheet.create({
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
});
