import { PackageCard } from "@/components/packageCard";
import PackageLocationListHeader from "@/components/PackageLocationListHeader";
import { useWalletUi } from "@/components/solana/use-wallet-ui";
import { PackageCardData } from "@/constants/countries";
import EvilIcons from "@react-native-vector-icons/fontawesome";
import { router } from "expo-router";
import React, { useCallback } from "react";
import { FlatList, Image, View } from "react-native";
import { TextInput } from "react-native-paper";
import { $styles } from "./styles";
import { useEsimHomeScreen } from "../../hooks/useEsimHomeScreen";

const tabs = ["Countries", "Regional"];

export function NoSimsHome() {
  const { account } = useWalletUi();
  const {
    tabIndex,
    searchQuery,
    filteredData,
    setSearchQuery,
    handleTabChange,
  } = useEsimHomeScreen();

  const renderCard = useCallback(
    ({ item }: { item: PackageCardData }) => (
      <View style={$styles.cardContainer}>
        <PackageCard
          onPress={() =>
            router.push({
              pathname: "/checkoutStack",
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
          <Image source={{ uri: account?.icon }} style={$styles.icon} />
        </View>
        <TextInput
          placeholder="Search your destination"
          mode="outlined"
          value={searchQuery}
          textColor="white"
          onChangeText={setSearchQuery}
          left={
            <TextInput.Icon
              icon={() => <EvilIcons name="search" size={24} color="gray" />}
            />
          }
        />
        <View style={$styles.searchSpacing} />
        <PackageLocationListHeader
          tabs={tabs}
          activeTab={tabIndex}
          onTabChange={handleTabChange}
        />
        <FlatList
          data={filteredData}
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
