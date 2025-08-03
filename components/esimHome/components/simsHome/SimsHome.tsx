import { useWalletUi } from "@/components/solana/use-wallet-ui";
import SlidingTabs from "@/components/Tab";
import React from "react";
import { Image, View, FlatList } from "react-native";
import { useEsimHomeScreen } from "../../hooks/useEsimHomeScreen";
import { SimSelector } from "../simSelector/SimSelector";
import { $styles } from "./styles";
import { SimUsagePanel } from "../simUsagePanel/SimUsagePanel";
import { BuyEsim } from "../buyEsim";
import { router } from "expo-router";
import { PackageDetailsCard } from "@/components/packageSelection/components";

const tabs = ["Current", "Expired"];

export function SimsHome() {
  const { account } = useWalletUi();
  const {
    tabIndex,
    selectedSim,
    sims,
    simDetails,
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
        <View style={{ width: '100%', height: 16 }} />
        {tabIndex === 1 ? (
          <FlatList
            data={simDetails}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item) => item.sim.iccid}
            renderItem={({ item }) => (
              <>
                <PackageDetailsCard
                  disabled
                  title={item.sim.package_title}
                  fields={item.packageDetails}
                  onPress={() => { }}
                  id={item.sim.iccid}
                />
                <View style={{ width: '100%', height: 16 }} />
              </>
            )}
            ListFooterComponent={
              <BuyEsim onBuyPress={() => router.push('/checkoutStack/addSim')} />
            }
            contentContainerStyle={$styles.listContent}
          />
        ) : (
          <>
            <SimSelector
              sims={sims}
              selectedSim={selectedSim}
              onSelectSim={(sim) => setSelectedSim(sim)}
            />
            <SimUsagePanel stats={usageStats[selectedSim?.iccid!]} />
            <BuyEsim onBuyPress={() => router.push('/checkoutStack/addSim')} />
          </>
        )}
      </View>
    </View>
  );
}
