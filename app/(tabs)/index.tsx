import EvilIcons from "@react-native-vector-icons/fontawesome";
import React, { useState, useCallback, useMemo } from "react";
import { Image, FlatList, StyleSheet, View } from "react-native";
import { TextInput } from "react-native-paper";
import Fuse from "fuse.js";
import { useWalletUi } from "@/components/solana/use-wallet-ui";
import {
  PackageCardData,
  countries,
  regions,
  transformCountriesToCardData,
  transformRegionsToCardData,
} from "@/constants/countries";
import { PackageCard } from "@/components/packageCard";
import PackageLocationListHeader from "@/components/PackageLocationListHeader";
import { Link, router } from "expo-router";

const tabs = ["Countries", "Regional plan"];

export default function HomeScreen() {
  const { account } = useWalletUi();
  const [tabIndex, setTabIndex] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const handleTabChange = useCallback((index: number) => {
    setTabIndex(index);
  }, []);

  const rawData = useMemo((): PackageCardData[] => {
    if (tabIndex === 0) {
      return transformCountriesToCardData(countries).filter(
        (item) => !item.disabled
      );
    } else {
      return transformRegionsToCardData(regions);
    }
  }, [tabIndex]);

  const fuse = useMemo(() => {
    return new Fuse(rawData, {
      keys: ["label"],
      threshold: 0.3,
    });
  }, [rawData]);

  const filteredData = useMemo(() => {
    if (!searchQuery) {
      return rawData;
    }
    return fuse.search(searchQuery).map((result) => result.item);
  }, [searchQuery, rawData, fuse]);

  const renderCard = useCallback(
    ({ item }: { item: PackageCardData }) => (
      <View style={styles.cardContainer}>
        <PackageCard
          onPress={() =>
            router.push({
              pathname: '/checkout',
              params: {
                region: item.region,
                label: item.label,
                countryCode: item.countryCode,
              }
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
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Image
            source={require("../../assets/app-logo-light.png")}
            style={styles.logo}
          />
          <Image source={{ uri: account?.icon }} style={styles.icon} />
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
        <View style={styles.searchSpacing} />
        <FlatList
          data={filteredData}
          keyExtractor={(item) => item.id}
          renderItem={renderCard}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          ListHeaderComponent={<PackageLocationListHeader tabs={tabs} activeTab={tabIndex} onTabChange={handleTabChange} />}
          stickyHeaderIndices={[0]}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 36,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 32,
  },
  logo: {
    width: 48,
    height: 48,
  },
  icon: {
    width: 48,
    height: 48,
  },
  searchSpacing: {
    height: 16,
  },
  tabsContainer: {
    position: "relative",
    zIndex: 1000,
    width: "100%",
    backgroundColor: "#111926",
    paddingTop: 8,
    paddingBottom: 8,
  },
  listContent: {
    paddingBottom: 16,
  },
  columnWrapper: {
    justifyContent: "space-between",
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  cardContainer: {
    flex: 1,
    marginHorizontal: 8,
  },
});
