import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";

interface CountrySelectorProps {
  country: string;
  flagUrl: string;
  onPress?: () => void;
}

export const CountrySelector: React.FC<CountrySelectorProps> = ({
  country,
  flagUrl,
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.countrySelector} onPress={onPress}>
      <Image source={{ uri: flagUrl }} style={styles.flag} />
      <Text style={styles.countryText}>{country}</Text>
      <Text style={styles.arrow}>→</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
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
});
