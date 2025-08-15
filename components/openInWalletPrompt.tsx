import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Linking,
  Clipboard,
  SafeAreaView,
  ScrollView,
} from "react-native";

const WALLETS = [
  {
    name: "Phantom",
    icon: require("@/assets/phantom.png"),
    link: (url: string) => `https://phantom.app/ul/browse/${url}?ref=phantom`,
  },
  {
    name: "Solflare",
    icon: require("@/assets/solflare.png"),
    link: (url: string) => `solflare://browser?url=${url}`,
  },
  {
    name: "Backpack",
    icon: require("@/assets/backpack.png"),
    link: (url: string) => `backpack://app/browser?url=${url}`,
  },
  {
    name: "Glow",
    icon: require("@/assets/glow.png"),
    link: (url: string) => `glow://browser?url=${url}`,
  },
  {
    name: "Trust Wallet",
    icon: require("@/assets/trust.png"),
    link: (url: string) => `trust://browser?url=${url}`,
  },
  {
    name: "MetaMask",
    icon: require("@/assets/metamask.png"),
    link: (url: string) => `metamask://dapp/${url}`,
  },
  {
    name: "Coinbase",
    icon: require("@/assets/coinbase.png"),
    link: (url: string) => `cbwallet://dapp/${url}`,
  },
];

export function OpenInWalletPrompt() {
  const appUrl = window.location.href;
  const encodedUrl = encodeURIComponent(appUrl);
  const [copied, setCopied] = useState(false);

  const openWallet = async (walletLink: (url: string) => string) => {
    const deepLink = walletLink(encodedUrl);

    try {
      const supported = await Linking.canOpenURL(deepLink);
      if (supported) {
        await Linking.openURL(deepLink);
      } else {
        alert("Could not open wallet. Please make sure it is installed.");
      }
    } catch (error) {
      alert("Could not open wallet. Please make sure it is installed.");
    }
  };

  const copyToClipboard = () => {
    Clipboard.setString(appUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Open This App in Your Wallet</Text>
          <Text style={styles.subtitle}>
            For the best experience, open this app inside your favorite mobile
            wallet browser. Choose one below or copy the link to paste into
            your wallet.
          </Text>
        </View>

        <View style={styles.walletList}>
          {WALLETS.map((wallet) => (
            <TouchableOpacity
              key={wallet.name}
              style={styles.walletButton}
              onPress={() => openWallet(wallet.link)}
              activeOpacity={0.7}
            >
              <Image source={wallet.icon} style={styles.walletIcon} />
              <Text style={styles.walletName}>{wallet.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.copySection}>
          <TouchableOpacity
            style={styles.copyButton}
            onPress={copyToClipboard}
            activeOpacity={0.8}
          >
            <Text style={styles.copyButtonText}>📋 Copy App Link</Text>
          </TouchableOpacity>
          {copied && <Text style={styles.copiedText}>✅ Link copied!</Text>}
          <Text style={styles.copyHint}>
            Paste this link into your wallet's browser to open the app.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0A0F1C",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 160,
  },
  header: {
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 16,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  walletList: {
    width: "100%",
    marginBottom: 30,
  },
  walletButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1C2230",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  walletIcon: {
    width: 32,
    height: 32,
    marginRight: 16,
    resizeMode: "contain",
  },
  walletName: {
    color: "white",
    fontSize: 18,
    fontWeight: "500",
  },
  copySection: {
    alignItems: "center",
    paddingTop: 10,
  },
  copyButton: {
    backgroundColor: "#2D3748",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    marginBottom: 12,
  },
  copyButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  copiedText: {
    color: "#4ADE80",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  copyHint: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 13,
    textAlign: "center",
    maxWidth: 280,
    lineHeight: 18,
  },
});
