import { Icon } from "@/components/Icon";
import { PackageCard } from "@/components/packageCard";
import PackageLocationListHeader from "@/components/PackageLocationListHeader";
import { WalletConnectionButton } from "@/components/WalletConnectionButton";
import { PackageCardData } from "@/constants/countries";
import { useSafeNavigation } from "@/hooks/use-safe-navigation";
import React, { useCallback } from "react";
import { FlatList, Image, View } from "react-native";
import { TextInput } from "react-native-paper";
import { useEsimHomeScreen } from "../../hooks/useEsimHomeScreen";
import { $styles } from "./styles";

const tabs = ["Countries", "Regional"];

export function NoSimsHome() {
  const {
    tabIndex,
    searchQuery,
    filteredData,
    setSearchQuery,
    handleTabChange,
  } = useEsimHomeScreen();
  const navigation = useSafeNavigation()

  const renderCard = useCallback(
    ({ item }: { item: PackageCardData }) => (
      <View style={$styles.cardContainer}>
        <PackageCard
          onPress={() =>
            navigation.navigate("checkoutStack", {
              screen: "index",
              params: {
                region: item.region,
                label: item.label,
                countryCode: item.countryCode,
              },
            })
          }
          label={item.label}
          countryCode={item.countryCode}
          imageUri={item.imageUri}
        />
      </View>
    ),
    []
  );

  return (
    <View style={$styles.container}>
      <View style={$styles.content}>
        <View style={$styles.header}>
          <Image
            source={require("@/assets/app-logo-light.png")}
            style={$styles.logo}
          />
          <WalletConnectionButton />
        </View>
        <TextInput
          placeholder="Search your destination"
          mode="outlined"
          value={searchQuery}
          textColor="white"
          onChangeText={setSearchQuery}
          left={
            <Icon icon="search" />
          }
        />
        <View style={$styles.searchSpacing} />
        <PackageLocationListHeader
          tabs={tabs}
          activeTab={tabIndex}
          onTabChange={handleTabChange}
        />
        {
          tabIndex > 0 &&
          <View style={{ paddingHorizontal: 8, paddingTop: 16, }}>
            {renderCard({ item: filteredData[0] })}
          </View>
        }
        <FlatList
          data={filteredData.slice(tabIndex)}
          keyExtractor={(item) => item.id}
          renderItem={renderCard}
          numColumns={2}
          columnWrapperStyle={$styles.columnWrapper}
          ListHeaderComponent={<View style={$styles.searchSpacing} />}
          stickyHeaderIndices={[0]}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={$styles.listContent}
        />
      </View>
    </View>
  );
}
