import { useWalletUi } from "@/components/solana/use-wallet-ui";
import SlidingTabs from "@/components/Tab";
import React from "react";
import { Image, View } from "react-native";
import { useEsimHomeScreen } from "../../hooks/useEsimHomeScreen";
import { SimSelector } from "../simSelector/SimSelector";
import { $styles } from "./styles";
import { SimUsagePanel } from "../simUsagePanel/SimUsagePanel";
import { BuyEsim } from "../buyEsim";
import { router } from "expo-router";

const tabs = ["Current", "Expired"];

export function SimsHome() {
  const { account } = useWalletUi();
  const {
    tabIndex,
    selectedSim,
    sims,
    usageStats,
    setSelectedSim,
    handleTabChange,
  } = useEsimHomeScreen();

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
        <SimSelector
          sims={sims}
          selectedSim={selectedSim}
          onSelectSim={(sim) => setSelectedSim(sim)}
        />
        <SimUsagePanel stats={usageStats} />
        <BuyEsim onBuyPress={() => router.replace('/')} />
      </View>
    </View>
  );
}
