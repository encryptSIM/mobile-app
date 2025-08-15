import React, { useState } from "react";
import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { useUnifiedWallet } from "@/hooks/use-unified-wallet";
import { addressFormatter } from "@/utils";

interface WalletConnectionButtonProps {
  onConnected?: () => void;
  onDisconnected?: () => void;
  style?: any;
  fullWidth?: boolean;
  showAddress?: boolean;
}

export const WalletConnectionButton: React.FC<WalletConnectionButtonProps> = ({
  onConnected,
  onDisconnected,
  style,
  fullWidth = false,
  showAddress = true,
}) => {
  const { colors } = useTheme();
  const wallet = useUnifiedWallet();
  const [connecting, setConnecting] = useState(false);
  console.log("wallet", wallet);

  const handleConnect = async () => {
    if (connecting) return;

    try {
      setConnecting(true);
      await wallet.connect();

      Alert.alert(
        "Wallet Connected",
        `Successfully connected to your Solana wallet!`,
        [{ text: "OK" }]
      );

      onConnected?.();
    } catch (error: any) {
      console.error("Wallet connection error:", error);

      let errorMessage = "Failed to connect wallet";
      if (error.message.includes("No compatible wallet found")) {
        errorMessage =
          "No Solana wallet found. Please install a compatible wallet app like Phantom, Solflare, or others.";
      } else if (error.message.includes("User declined")) {
        errorMessage =
          "Connection cancelled. Please try again and approve the connection.";
      } else {
        errorMessage = error.message || "An unexpected error occurred";
      }

      Alert.alert("Connection Failed", errorMessage);
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = () => {
    Alert.alert(
      "Disconnect Wallet",
      "Are you sure you want to disconnect your wallet?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Disconnect",
          style: "destructive",
          onPress: () => {
            wallet.disconnect();
            onDisconnected?.();
            Alert.alert("Disconnected", "Wallet has been disconnected");
          },
        },
      ]
    );
  };

  const isLoading = connecting || wallet.connecting;

  if (wallet.connected && wallet.selectedAccount) {
    return (
      <View style={[styles.container, fullWidth && styles.fullWidth, style]}>
        {showAddress && (
          <View style={styles.accountInfo}>
            <View style={styles.accountRow}>
              <Feather name="check-circle" size={16} color={colors.primary} />
              <Text style={[styles.connectedText, { color: colors.primary }]}>
                Connected
              </Text>
            </View>
            <Text style={[styles.addressText, { color: colors.text }]}>
              {addressFormatter(wallet.selectedAccount.address)}
            </Text>
            {wallet.selectedAccount.label && (
              <Text style={[styles.labelText, { color: colors.text }]}>
                {wallet.selectedAccount.label}
              </Text>
            )}
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.button,
            styles.disconnectButton,
            { borderColor: colors.primary },
          ]}
          onPress={handleDisconnect}
        >
          <Text style={[styles.buttonText, { color: colors.primary }]}>
            Disconnect
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={[
        styles.button,
        styles.connectButton,
        { backgroundColor: colors.primary },
        fullWidth && styles.fullWidth,
        isLoading && styles.loadingButton,
        style,
      ]}
      onPress={handleConnect}
      disabled={isLoading}
    >
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="white" />
          <Text style={[styles.buttonText, styles.whiteText]}>
            Connecting...
          </Text>
        </View>
      ) : (
        <View style={styles.buttonContent}>
          <Feather name="link" size={18} color="white" />
          <Text style={[styles.buttonText, styles.whiteText]}>
            Connect Wallet
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  fullWidth: {
    width: "100%",
  },
  accountInfo: {
    alignItems: "center",
    marginBottom: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  accountRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  connectedText: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
  addressText: {
    fontSize: 12,
    fontFamily: "monospace",
    marginTop: 2,
  },
  labelText: {
    fontSize: 11,
    opacity: 0.7,
    marginTop: 2,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 140,
  },
  connectButton: {
    // backgroundColor set dynamically
  },
  disconnectButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
  },
  loadingButton: {
    opacity: 0.7,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  whiteText: {
    color: "white",
    marginLeft: 8,
  },
});
