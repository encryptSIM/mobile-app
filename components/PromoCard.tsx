import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";

interface PromoCardProps {
  title: string;
  subtitle: string;
  onPress?: () => void;
}

export const PromoCard: React.FC<PromoCardProps> = ({
  title,
  subtitle,
  onPress,
}) => {
  return (
    <View style={styles.promoCard}>
      <View style={styles.promoIconBox}>
        <Image
          source={require("../assets/onboarding/shield.png")}
          style={styles.promoIcon}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.promoTitle}>{title}</Text>
        <Text style={styles.promoSubtitle}>{subtitle}</Text>
      </View>
      <TouchableOpacity style={styles.promoArrowBox} onPress={onPress}>
        <Text style={styles.promoArrow}>→</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
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
