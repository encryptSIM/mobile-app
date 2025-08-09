import React from "react";
import { Image, Text, View } from "react-native";
import * as Progress from "react-native-progress";
import { NoSimsHome, SimsHome } from "./components";
import { useEsimHomeScreen } from "./hooks/useEsimHomeScreen";
import { $styles } from "./styles";

export function EsimHomeScreen() {
  const {
    sims,
    showContent,
    progress,
  } = useEsimHomeScreen();

  if (!showContent) {
    return (
      <View style={$styles.loading}>
        <Image
          source={require("../../assets/splash/logo.png")}
          style={$styles.splashLogo}
        />
        <Text style={$styles.title}>encryptSIM</Text>
        <Text style={$styles.subtitle}>
          Web3 + eSIM + dVPN{"\n"}Total Privacy {"\n"}
        </Text>
        <View style={$styles.progress}>
          <Progress.Bar
            progress={progress}
            width={250}
            color="#32D583"
            animated
          />
        </View>
      </View>
    );
  }

  return sims.length > 0 ? <SimsHome /> : <NoSimsHome />;
}
