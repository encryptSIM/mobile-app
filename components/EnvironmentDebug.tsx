import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import {
  detectEnvironment,
  shouldUseWebWalletAdapter,
  shouldUseMobileWalletAdapter,
  detectWallets,
} from "@/utils/environment";

interface EnvironmentDebugProps {
  show?: boolean;
}


export const EnvironmentDebug: React.FC<EnvironmentDebugProps> = ({
  show = false,
}) => {
  if (!show) return null;

  const env = detectEnvironment();
  const useWeb = shouldUseWebWalletAdapter();
  const useMobile = shouldUseMobileWalletAdapter();
  const wallets = detectWallets();

  const renderStatus = (label: string, value: boolean | string) => (
    <View style={styles.row} key={label}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, value ? styles.yes : styles.no]}>
        {typeof value === "boolean" ? (value ? "✅" : "❌") : value}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔍 Environment Debug</Text>
      <ScrollView style={{ maxHeight: 250 }}>
        <Text style={styles.section}>🌐 Environment</Text>
        {renderStatus("Platform", env.platform)}
        {renderStatus("Is Web", env.isWeb)}
        {renderStatus("Is Mobile", env.isMobile)}
        {renderStatus("Is Wallet Browser", env.isWalletBrowser)}
        {renderStatus("Is Native App", env.isNativeApp)}
        {renderStatus("Use Web Adapter", useWeb)}
        {renderStatus("Use Mobile Adapter", useMobile)}

        <Text style={styles.section}>👛 Wallet Detection</Text>
        {Object.entries(wallets).map(([name, active]) =>
          renderStatus(name, active)
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 50,
    left: 10,
    right: 10,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    padding: 12,
    borderRadius: 10,
    zIndex: 1000,
  },
  title: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  section: {
    color: "#4FC3F7",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 10,
    marginBottom: 4,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  label: {
    color: "white",
    fontSize: 12,
  },
  value: {
    fontSize: 12,
    fontWeight: "bold",
  },
  yes: {
    color: "#4CAF50", // green
  },
  no: {
    color: "#F44336", // red
  },
});
