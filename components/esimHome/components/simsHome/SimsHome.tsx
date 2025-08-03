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
import SlidingTabs from "@/components/Tab";

const tabs = ["Current", "Expired"];

export function SimsHome() {
  const { account } = useWalletUi();
  const {
    tabIndex,
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
        <SlidingTabs tabs={tabs} activeTab={tabIndex} onTabChange={handleTabChange} />
      </View>
    </View>
  );
}

