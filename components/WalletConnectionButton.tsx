import React, { useState, useEffect } from "react";
import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
  Pressable,
  Image,
} from "react-native";
import { useUnifiedWallet } from "@/hooks/use-unified-wallet";
import { addressFormatter } from "@/utils";
import { BlurView } from "expo-blur";
import { useGetBalance } from "./solana/use-get-balance";
import { brandGreen } from "./app-providers";
import { lamportsToSol } from "@/utils/lamports-to-sol";
import { useAuth } from "./auth/auth-provider";
import { Icon } from "./Icon";

interface WalletConnectionButtonProps {
  onConnected?: () => void;
  onDisconnected?: () => void;
  onSwitchAccount?: () => void;
  style?: any;
}

const truncateAddress = (address: string, startChars = 6, endChars = 4) => {
  if (!address) return '';
  if (address.length <= startChars + endChars) return address;
  return `${address.substring(0, startChars)}...${address.substring(address.length - endChars)}`;
};

const designColors = {
  primary: "#00D4AA",
  secondary: "#6366F1",
  bg: "rgba(17, 24, 39, 0.95)",
  cardBg: "rgba(31, 41, 55, 0.8)",
  border: "rgba(75, 85, 99, 0.3)",
  text: "#FFFFFF",
  textSecondary: "rgba(255, 255, 255, 0.7)",
  textTertiary: "rgba(255, 255, 255, 0.5)",
  buttonBg: "rgba(55, 65, 81, 0.8)",
  buttonText: "#FFFFFF",
  success: "#10B981",
  danger: "#EF4444",
};

export function WalletConnectionButton({
  onConnected,
  onSwitchAccount,
  style,
}: WalletConnectionButtonProps) {
  const wallet = useUnifiedWallet();
  const { signOut } = useAuth();
  const balance = useGetBalance({ address: wallet.publicKey! });
  const [connecting, setConnecting] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    console.log("🔍 WalletConnectionButton state:", {
      connected: wallet.connected,
      connecting: wallet.connecting,
      hasSelectedAccount: !!wallet.selectedAccount,
      selectedAccount: wallet.selectedAccount?.address,
      hasPublicKey: !!wallet.publicKey,
    });
  }, [wallet.connected, wallet.connecting, wallet.selectedAccount, wallet.publicKey]);

  const handleConnect = async () => {
    if (connecting || wallet.connecting) return;

    try {
      setConnecting(true);
      console.log("🔄 Starting wallet connection...");

      await wallet.connect();

      // Add a small delay to ensure state updates
      await new Promise(resolve => setTimeout(resolve, 100));

      console.log("✅ Wallet connection completed");
      onConnected?.();
    } catch (error: any) {
      console.error("❌ Wallet connection error:", error);
      Alert.alert("Connection Failed", error.message || "Unexpected error");
    } finally {
      setConnecting(false);
    }
  };

  const isLoading = connecting || wallet.connecting;
  const isConnected = wallet.connected && wallet.selectedAccount;

  const handleDisconnect = () => {
    console.log("handleDisconnect");
    setMenuVisible(false);
    signOut();
  };

  const handleSwitchAccount = () => {
    setMenuVisible(false);
    onSwitchAccount?.();
  };

  const handleCopyAddress = () => {
    Alert.alert("Copied!", "Address copied to clipboard");
  };

  const getIcon = (address: string) => {
    return `https://api.dicebear.com/9.x/rings/svg?ringColor=${brandGreen}&seed=${address}`;
  };

  if (isConnected) {
    return (
      <>
        <TouchableOpacity
          style={[styles.connectedButton, { backgroundColor: designColors.buttonBg }, style]}
          onPress={() => setMenuVisible(true)}
          activeOpacity={0.7}
        >
          <Image
            source={{ uri: getIcon(String(wallet.selectedAccount!.address)) }}
            style={styles.avatar}
          />

          <Text style={[styles.addressText, { color: designColors.buttonText }]}>
            {addressFormatter(wallet.selectedAccount!.address)}
          </Text>

          <Icon icon={'chevronDown'} size="small" colour={designColors.textTertiary} />
        </TouchableOpacity>

        <Modal
          transparent
          visible={menuVisible}
          animationType="fade"
          onRequestClose={() => setMenuVisible(false)}
        >
          <BlurView intensity={20} style={styles.blurOverlay}>
            <Pressable
              style={styles.modalOverlay}
              onPress={() => setMenuVisible(false)}
            >
              <View style={[styles.walletModal, { backgroundColor: designColors.bg }]}>
                <View style={styles.modalHeader}>
                  <TouchableOpacity
                    onPress={() => setMenuVisible(false)}
                    style={styles.closeButton}
                  >
                    <Icon icon={'x'} size="normal" colour={designColors.textSecondary} />
                  </TouchableOpacity>
                </View>

                <View style={styles.walletInfo}>
                  <Image
                    source={{ uri: getIcon(String(wallet.selectedAccount!.address)) }}
                    style={styles.avatarLarge}
                  />

                  <View style={styles.addressSection}>
                    <Text style={[styles.fullAddress, { color: designColors.text }]}>
                      {truncateAddress(wallet.selectedAccount!.address, 8, 6)}
                    </Text>
                    <TouchableOpacity
                      style={styles.copyButton}
                      onPress={handleCopyAddress}
                    >
                      <Icon icon={'copy'} size="normal" colour={designColors.primary} />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.balanceSection}>
                  <Text style={[styles.balanceLabel, { color: designColors.textSecondary }]}>
                    Balance
                  </Text>
                  <Text style={[styles.balanceValue, { color: designColors.text }]}>
                    {balance?.data ? `${lamportsToSol(balance.data)} SOL` : 'Loading...'}
                  </Text>
                </View>

                <View style={styles.actionsSection}>
                  <TouchableOpacity
                    style={[styles.actionButton, {
                      backgroundColor: designColors.cardBg,
                      borderColor: designColors.border
                    }]}
                    onPress={handleDisconnect}
                  >
                    <Icon icon={'logout'} size="normal" colour={designColors.danger} />
                    <Text style={[styles.actionText, { color: designColors.danger }]}>
                      Disconnect
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Pressable>
          </BlurView>
        </Modal>
      </>
    );
  }

  return (
    <TouchableOpacity
      style={[
        styles.connectButton,
        {
          backgroundColor: isLoading ? designColors.buttonBg : designColors.primary,
          borderColor: designColors.border,
        },
        style,
      ]}
      onPress={handleConnect}
      disabled={isLoading}
      activeOpacity={0.7}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={designColors.buttonText} />
      ) : (
        <Icon icon={'swap'} size="normal" colour="#000" />
      )}
      {!isLoading && (
        <Text style={[styles.connectText, { color: "#000" }]}>Connect</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  connectedButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(75, 85, 99, 0.3)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  connectButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: "#00D4AA",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 32,
  },
  avatarLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  addressText: {
    fontSize: 13,
    fontWeight: "500",
    fontFamily: "monospace",
    marginLeft: 8,
    marginRight: 4,
    opacity: 0.9,
  },
  connectText: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
  blurOverlay: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  walletModal: {
    width: "100%",
    maxWidth: 340,
    borderRadius: 20,
    padding: 0,
    borderWidth: 1,
    borderColor: "rgba(75, 85, 99, 0.3)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingBottom: 16,
  },
  closeButton: {
    padding: 4,
  },
  walletInfo: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  addressSection: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    backgroundColor: "rgba(31, 41, 55, 0.5)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    maxWidth: "100%",
  },
  fullAddress: {
    fontSize: 13,
    fontFamily: "monospace",
    flex: 1,
    marginRight: 8,
  },
  copyButton: {
    padding: 4,
  },
  balanceSection: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  balanceLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  balanceValue: {
    fontSize: 28,
    fontWeight: "700",
  },
  actionsSection: {
    padding: 20,
    paddingTop: 0,
    gap: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  actionText: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});
