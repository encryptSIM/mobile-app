import React, { useState } from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  Image,
  Modal,
  Pressable,
  Platform,
  Alert,
} from "react-native";
import { useWalletAuth } from "./auth/wallet-auth-provider";
import { brandGreen, card } from "./app-providers";
import { Icon } from "./Icon";
import { useGetBalance } from "./solana/use-get-balance";
import { lamportsToSol } from "@/utils/lamports-to-sol";
import * as Clipboard from "expo-clipboard";
import { PublicKey } from "@solana/web3.js";

interface WalletButtonProps {
  style?: any;
}

export function WalletConnectionButton({ style }: WalletButtonProps) {
  const { isConnected, isLoading, account, connect, disconnect } =
    useWalletAuth();
  const [menuVisible, setMenuVisible] = useState(false);

  const publicKey = account?.address ? new PublicKey(account.address) : null;
  const balance = useGetBalance({ address: publicKey! });

  const handlePress = async () => {
    if (isConnected) {
      setMenuVisible(true);
    } else {
      try {
        await connect();
      } catch (error: any) {
        if (Platform.OS === "web") {
          window.alert("Connection Failed: " + error.message);
        } else {
          Alert.alert("Connection Failed", error.message);
        }
      }
    }
  };

  const truncateAddress = (address: string) =>
    `${address.slice(0, 6)}...${address.slice(-4)}`;

  const getIcon = (address: string) =>
    `https://api.dicebear.com/9.x/rings/png?ringColor=${brandGreen}&seed=${address}`;

  const handleCopyAddress = async () => {
    if (account?.address) {
      await Clipboard.setStringAsync(account.address);
      if (Platform.OS === "web") {
        window.alert("Address copied to clipboard");
      } else {
        Alert.alert("Copied!", "Address copied to clipboard");
      }
    }
  };

  return (
    <>
      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: isConnected ? card : brandGreen },
          style,
        ]}
        onPress={handlePress}
        disabled={isLoading}
        activeOpacity={0.8}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={isConnected ? "#fff" : "#000"} />
        ) : isConnected && account ? (
          <View style={styles.connectedContent}>
            <Image
              source={{ uri: getIcon(account.address) }}
              style={styles.avatar}
            />
            <Text style={[styles.text, { color: "#fff" }]}>
              {truncateAddress(account.address)}
            </Text>
            <Icon icon="chevronDown" size="small" colour="rgba(255,255,255,0.6)" />
          </View>
        ) : (
          <Text style={[styles.text, { color: "#000" }]}>Connect Wallet</Text>
        )}
      </TouchableOpacity>

      {isConnected && account && (
        <Modal
          transparent
          visible={menuVisible}
          animationType="fade"
          onRequestClose={() => setMenuVisible(false)}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setMenuVisible(false)}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity
                  onPress={() => setMenuVisible(false)}
                  style={styles.closeButton}
                >
                  <Icon icon="x" size="normal" colour="rgba(255,255,255,0.6)" />
                </TouchableOpacity>
              </View>

              <View style={styles.walletInfo}>
                <Image
                  source={{ uri: getIcon(account.address) }}
                  style={styles.modalAvatar}
                />
                <View style={styles.addressRow}>
                  <Text style={styles.fullAddress}>
                    {truncateAddress(account.address)}
                  </Text>
                  <TouchableOpacity
                    style={styles.copyButton}
                    onPress={handleCopyAddress}
                  >
                    <Icon icon="copy" size="normal" colour={brandGreen} />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.balanceSection}>
                <Text style={styles.balanceLabel}>Balance</Text>
                <Text style={styles.balanceValue}>
                  {balance?.data
                    ? `${lamportsToSol(balance.data)} SOL`
                    : "Loading..."}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.disconnectButton}
                onPress={() => {
                  setMenuVisible(false);
                  disconnect();
                }}
              >
                <Icon icon="logout" size="normal" colour="#EF4444" />
                <Text style={styles.disconnectText}>Disconnect</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Modal>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(75, 85, 99, 0.3)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minWidth: 140,
    justifyContent: "center",
  },
  connectedContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 22,
    height: 22,
    borderRadius: 32,
    marginRight: 8,
  },
  text: {
    fontSize: 14,
    fontWeight: "600",
    marginRight: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: "rgba(17, 24, 39, 0.95)",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(75, 85, 99, 0.3)",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  closeButton: {
    padding: 4,
  },
  walletInfo: {
    alignItems: "center",
    marginVertical: 16,
  },
  modalAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: 12,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(31, 41, 55, 0.5)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  fullAddress: {
    fontSize: 14,
    fontFamily: "monospace",
    color: "#fff",
    marginRight: 8,
  },
  copyButton: {
    padding: 4,
  },
  balanceSection: {
    alignItems: "center",
    marginVertical: 16,
  },
  balanceLabel: {
    fontSize: 14,
    color: "rgba(255,255,255,0.6)",
    marginBottom: 4,
  },
  balanceValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
  },
  disconnectButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(75, 85, 99, 0.3)",
    backgroundColor: "rgba(31, 41, 55, 0.8)",
    marginTop: 12,
  },
  disconnectText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#EF4444",
    marginLeft: 8,
  },
});
