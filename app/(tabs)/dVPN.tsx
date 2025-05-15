import React from "react";
import { View, StyleSheet, ImageBackground, Alert } from "react-native";
import { TopBar } from "../../components/TopBar";
import { PowerButton } from "../../components/PowerButton";
import { CountrySelector } from "../../components/CountrySelector";
import { PromoCard } from "../../components/PromoCard";
import { useVpnNode } from "../../hooks/useVpnNode";

export default function DVpnScreen() {
  // const { findNode, loading } = useVpnNode();

  // const handlePowerPress = async () => {
  //   const node = await findNode();
  //   if (node) {
  //     Alert.alert("Connected", `Connected to: ${node.url}`);
  //   } else {
  //     Alert.alert("Error", "No working VPN node found.");
  //   }
  // };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../../assets/images/main-background.png")}
        style={styles.background}
        imageStyle={styles.imageStyle}
      >
        <TopBar onAvatarPress={() => console.log("Avatar pressed")} />
        <CountrySelector
          country="US"
          flagUrl="https://www.countryflags.io/us/flat/64.png"
        />
        <PowerButton onPress={() => {}} />
        <PromoCard
          title="Get 10% off your first purchase"
          subtitle="Use code: DVPN10"
        />
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E263C",
  },
  background: {
    flex: 1,
    paddingTop: 48,
    paddingHorizontal: 16,
  },
  imageStyle: {
    resizeMode: "cover",
  },
});
