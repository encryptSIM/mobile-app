import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageBackground,
  TouchableOpacity,
} from "react-native";

export default function DVpnScreen() {
  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../../assets/images/main-background.png")}
        style={styles.background}
        imageStyle={{ opacity: 0.3 }}
      >
        {/* Top bar */}
        <View style={styles.topBar}>
          <Image
            source={require("../../assets/onboarding/shield.png")}
            style={styles.shield}
          />
          <TouchableOpacity>
            <Image
              source={{ uri: "https://i.pravatar.cc/100" }}
              style={styles.avatar}
            />
          </TouchableOpacity>
        </View>

        {/* Power button */}
        <View style={styles.centerContent}>
          <TouchableOpacity style={styles.powerButton}>
            <Text style={styles.powerIcon}>⏻</Text>
          </TouchableOpacity>
        </View>

        {/* Country selector */}
        <View style={styles.countrySelector}>
          <Image
            source={{ uri: "https://flagcdn.com/us.png" }}
            style={styles.flag}
          />
          <Text style={styles.countryText}>United States</Text>
          <Text style={styles.arrow}>→</Text>
        </View>

        {/* Promo card */}
        <View style={styles.promoCard}>
          <View style={styles.promoIconBox}>
            <Image
              source={require("../../assets/onboarding/shield.png")}
              style={styles.promoIcon}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.promoTitle}>Get encryptSIM</Text>
            <Text style={styles.promoSubtitle}>
              Free dVPN access on any plan
            </Text>
          </View>
          <TouchableOpacity style={styles.promoArrowBox}>
            <Text style={styles.promoArrow}>→</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0E1220" },
  background: { flex: 1, resizeMode: "cover", paddingTop: 48 },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    marginTop: 8,
  },
  shield: { width: 36, height: 36, resizeMode: "contain" },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#fff",
  },
  centerContent: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 48,
    marginBottom: 32,
  },
  powerButton: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "#B71C1C",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 8,
  },
  powerIcon: { fontSize: 64, color: "#fff" },
  countrySelector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#181C2A",
    borderRadius: 32,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginHorizontal: 32,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  flag: { width: 32, height: 32, borderRadius: 16, marginRight: 12 },
  countryText: { color: "#fff", fontSize: 18, flex: 1 },
  arrow: { color: "#00FFAA", fontSize: 24 },
  promoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#181C2A",
    borderRadius: 20,
    marginHorizontal: 32,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  promoIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#23273A",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  promoIcon: { width: 32, height: 32, resizeMode: "contain" },
  promoTitle: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  promoSubtitle: { color: "#aaa", fontSize: 13 },
  promoArrowBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#00FFAA",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },
  promoArrow: { color: "#181C2A", fontSize: 22, fontWeight: "bold" },
});
