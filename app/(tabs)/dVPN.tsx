import React from "react";
import { View, StyleSheet, ImageBackground } from "react-native";
import { TopBar } from "../../components/TopBar";
import { PowerButton } from "../../components/PowerButton";
import { CountrySelector } from "../../components/CountrySelector";
import { PromoCard } from "../../components/PromoCard";
import { findWorkingVpnNode } from "../../service/vpnService";

export default function DVpnScreen() {
  const handlePowerPress = async () => {
    try {
      const node = await findWorkingVpnNode();
      console.log("Found working node:", node);
    } catch (error) {
      console.error("Failed to find working node:", error);
    }
  };

  const handleAvatarPress = () => {
    // Handle avatar press - navigate to profile or show menu
    console.log("Avatar pressed");
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../../assets/images/main-background.png")}
        style={styles.background}
        imageStyle={{ opacity: 0.3 }}
      >
        <TopBar onAvatarPress={handleAvatarPress} showBackButton={false} />
        <PowerButton onPress={handlePowerPress} />
        <CountrySelector
          country="United States"
          flagUrl="https://flagcdn.com/us.png"
        />
        <PromoCard
          title="Get encryptSIM"
          subtitle="Free dVPN access on any plan"
        />
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0E1220" },
  background: { flex: 1, resizeMode: "cover", paddingTop: 48 },
});
