import { Cart, PackageDetailsCard, PackageEmptyState, PackageErrorState, PackageFilters, PackageListFooter } from "@/components/packageSelection/components";
import { PackageItem, usePackageData } from "@/components/packageSelection/hooks";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback } from "react";
import {
  FlatList,
  ListRenderItem,
  RefreshControl,
  View,
  SafeAreaView
} from "react-native";
import { Appbar, Text } from "react-native-paper";
import { $styles } from "./styles";
import { background, brandGreen } from "../app-providers";

const MAX_PACKAGES = 1
export function SelectPackageScreen() {
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
        price={item.localPackage?.prices?.net_price?.USD!}
        id={item.id}
        fields={item.packageDetails}
        selected={selectedPackages.includes(item.id)}
        onPress={() => handlePackagePress(item.id)}
      />
    ),
    [selectedPackages, handlePackagePress]
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
      <SafeAreaView className={`h-full w-full px-5 bg-[${background}]`}>
        <PackageErrorState onRetry={onRefresh} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={$styles.root}>
      <Appbar.Header style={$styles.header}>
        <Appbar.BackAction onPress={router.back} />
        <Appbar.Content title={local.label} />
      </Appbar.Header>
      <View style={$styles.listHeader}>
        <PackageFilters
          isLoading={isLoading}
          days={filters}
          selectedFilters={filter}
          onFilterPress={handleFilterPress}
          packageCount={filteredPackages.length}
        />
        <Text variant="headlineSmall" style={$styles.text}>
          Available Plans
        </Text>
      </View>
      <View style={$styles.listContainer}>
        <FlatList
          data={filteredPackages}
          renderItem={renderPackageItem}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={selectedPackages.length < 1 ? renderFooter : null}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[brandGreen]}
              tintColor={brandGreen}
            />
          }
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        />
      </View>

      <View style={{ height: 150 * selectedPackages.length }} />
      <Cart
        items={filteredPackages.filter(t => selectedPackages.includes(t.id)).map(selectedPackage => ({
          description: String(selectedPackage.localPackage?.title),
          value: selectedPackage.localPackage?.prices?.net_price?.USD!,
          qty: selectedPackageQtyMap[selectedPackage.id].qty,
          id: selectedPackage.id,
          increment: () => {
            console.log(selectedPackage.id)
            console.log(selectedPackageQtyMap)
            setSeletedPackageQtyMap(prev => ({
              ...prev,
              [selectedPackage.id]: {
                ...prev[selectedPackage.id],
                qty: prev[selectedPackage.id] ? prev[selectedPackage.id].qty + 1 : 1
              }
            }))
          },
          decrement: () => {
            setSeletedPackageQtyMap(prev => ({
              ...prev,
              [selectedPackage.id]: {
                ...prev[selectedPackage.id],
                qty: prev[selectedPackage.id] ? prev[selectedPackage.id].qty - 1 : 1,
              }
            }))
          },
        }))}
        onCheckout={() => {
          router.push({
            pathname: "/checkoutStack/checkout",
            params: {
              title: local.label,
              countryCode: local.countryCode,
              region: local.region,
            },
          })
        }}
      />

    </SafeAreaView>
  );
}

