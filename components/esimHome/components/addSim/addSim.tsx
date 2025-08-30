import { Icon } from "@/components/Icon";
import { PackageCard } from "@/components/packageCard";
import PackageLocationListHeader from "@/components/PackageLocationListHeader";
import { PackageCardData } from "@/constants/countries";
import { useSafeNavigation } from "@/hooks/use-safe-navigation";
import React, { useCallback } from "react";
import { Dimensions, FlatList, View } from "react-native";
import { Appbar, TextInput } from "react-native-paper";
import { useEsimHomeScreen } from "../../hooks/useEsimHomeScreen";
import { $styles } from "./styles";

const tabs = ["Countries", "Regional"];

export function AddSim() {
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
        <Appbar.Header style={$styles.header}>
          <Icon icon="back" onPress={navigation.goBack} colour="white" size="large" />
          <Appbar.Content title={"Add new eSIM"} />
        </Appbar.Header>
        <PackageLocationListHeader
          tabs={tabs}
          activeTab={tabIndex}
          onTabChange={handleTabChange}
        />
        <View style={$styles.searchSpacing} />
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
        <View style={$styles.body}>
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
            numColumns={Dimensions.get('window').width > 1000 ? 4 : Dimensions.get('window').width > 600 ? 3 : 2}
            ListHeaderComponent={<View style={$styles.listHeader} />}
            columnWrapperStyle={$styles.columnWrapper}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={$styles.listContent}
          />
        </View>
      </View>
    </View>
  );
}
