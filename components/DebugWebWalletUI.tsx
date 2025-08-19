import { useSimpleWebWallet } from "@/hooks/use-simple-web-wallet";
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";

export function WalletDebugUI() {
  const {
    connecting,
    connected,
    authorizedWallet,
    selectedAccount,
    publicKey,
    connect,
    disconnect,
  } = useSimpleWebWallet();

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🔍 Wallet Debug UI</Text>

      <Text style={styles.label}>Status:</Text>
      <Text style={styles.value}>
        {connecting
          ? "⏳ Connecting..."
          : connected
            ? "✅ Connected"
            : "❌ Not Connected"}
      </Text>

      <Text style={styles.label}>Provider:</Text>
      <Text style={styles.value}>
        {typeof window !== "undefined"
          ? Object.keys(window)
            .filter((k) =>
              ["solana", "solflare", "backpack"].includes(k.toLowerCase())
            )
            .join(", ") || "None detected"
          : "window not available"}
      </Text>

      <Text style={styles.label}>Public Key:</Text>
      <Text style={styles.value}>{publicKey?.toString() || "N/A"}</Text>

      <Text style={styles.label}>Selected Account:</Text>
      <Text style={styles.value}>
        {selectedAccount?.address || "N/A"}
      </Text>

      <Text style={styles.label}>Authorized Wallet:</Text>
      <Text style={styles.value}>
        {authorizedWallet
          ? JSON.stringify(authorizedWallet, null, 2)
          : "N/A"}
      </Text>

      <View style={styles.buttons}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#4ADE80" }]}
          onPress={connect}
        >
          <Text style={styles.buttonText}>Connect</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#F87171" }]}
          onPress={disconnect}
        >
          <Text style={styles.buttonText}>Disconnect</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0F1C",
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#9CA3AF",
    marginTop: 12,
  },
  value: {
    fontSize: 14,
    color: "white",
    marginTop: 4,
  },
  buttons: {
    flexDirection: "row",
    marginTop: 20,
    justifyContent: "space-between",
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
  },
});
