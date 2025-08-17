import { PackageDetailsCard } from "@/components/packageSelection/components";
import SlidingTabs from "@/components/Tab";
import { WalletConnectionButton } from "@/components/WalletConnectionButton";
import { useSafeNavigation } from "@/hooks/use-safe-navigation";
import React from "react";
import {
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  View,
} from "react-native";
import { useEsimHomeScreen } from "../../hooks/useEsimHomeScreen";
import { BuyEsim } from "../buyEsim";
import { InstallSimPanel } from "../installSimPanel";
import { SimSelector } from "../simSelector/SimSelector";
import { SimUsagePanel } from "../simUsagePanel/SimUsagePanel";
import { $styles } from "./styles";

const tabs = ["Current", "Expired"];

export function SimsHome() {
  const {
    tabIndex,
    selectedSim,
    sims,
    simDetails,
    usageStats,
    setSelectedSim,
    handleSimHomeTabChange,
  } = useEsimHomeScreen();
  const navigation = useSafeNavigation();
  return (
    <SafeAreaView style={$styles.container}>
      <ScrollView
        contentContainerStyle={$styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={$styles.header}>
          <Image
            source={require("@/assets/app-logo-light.png")}
            style={$styles.logo}
          />
          <WalletConnectionButton />
        </View>
        <SlidingTabs
          tabs={tabs}
          activeTab={tabIndex}
          onTabChange={handleSimHomeTabChange}
        />
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
                <View style={{ height: 16 }} />
              </>
            )}
            ListFooterComponent={
              <BuyEsim
                onBuyPress={() => navigation.navigate("checkoutStack", { screen: "addSim" })}
              />
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
            {selectedSim?.installed ? (
              <SimUsagePanel stats={usageStats[selectedSim?.iccid!]} />
            ) : (
              <InstallSimPanel sim={selectedSim!} />
            )}
          </>
        )}
        <BuyEsim
          onBuyPress={() => navigation.navigate("checkoutStack", { screen: "addSim" })}

        />
      </ScrollView>
    </SafeAreaView>
  );
}
