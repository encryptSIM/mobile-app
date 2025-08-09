import { PackageCard } from "@/components/packageCard";
import PackageLocationListHeader from "@/components/PackageLocationListHeader";
import { useWalletUi } from "@/components/solana/use-wallet-ui";
import { PackageCardData } from "@/constants/countries";
import EvilIcons from "@react-native-vector-icons/fontawesome";
import { router } from "expo-router";
import React, { useCallback } from "react";
import { FlatList, View } from "react-native";
import { Appbar, TextInput } from "react-native-paper";
import { useEsimHomeScreen } from "../../hooks/useEsimHomeScreen";
import { $styles } from "./styles";

const tabs = ["Countries", "Regional plan"];

export function AddSim() {
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
        <Appbar.Header style={$styles.header}>
          <Appbar.BackAction onPress={router.back} />
          <Appbar.Content title={"Add new eSIM"} />
        </Appbar.Header>
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
          ListHeaderComponent={<View style={$styles.listHeader} />}
          columnWrapperStyle={$styles.columnWrapper}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={$styles.listContent}
        />
      </View>
    </View>
  );
}

