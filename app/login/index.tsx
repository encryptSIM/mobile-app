import { AppButton } from "@/components/button";
import { Text, View } from "@/components/Themed";
import { WalletConnectionButton } from "@/components/WalletConnectionButton";
import { WalletAccountSelector } from "@/components/WalletAccountSelector";
import { useTheme } from "@react-navigation/native";
import { router } from "expo-router";
import { Image, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/context/auth-context";
import { useEffect } from "react";

export default function LoginScreen() {
  const { colors } = useTheme();
  const {
    publicKey,
    loading,
    deviceToken,
    deviceTokenLoading,
    isWalletConnected,
    currentPublicKey,
  } = useAuth();

  useEffect(() => {
    // Redirect if user has an account (wallet connected or legacy public key) and device token
    if ((currentPublicKey || publicKey) && deviceToken && !deviceTokenLoading) {
      router.replace("/(tabs)/esim/package");
    }
  }, [
    loading,
    publicKey,
    deviceToken,
    deviceTokenLoading,
    isWalletConnected,
    currentPublicKey,
  ]);

  const handleWalletConnected = () => {
    // Wallet connection successful, user can proceed to the app
    console.log("✅ Wallet connected in login screen");
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Top bar */}
      <View style={[styles.topBar, { backgroundColor: colors.background }]}>
        <Image
          source={require("../../assets/splash/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <TouchableOpacity
          style={[styles.onboardingButton, { backgroundColor: colors.primary }]}
          onPress={() => router.replace("/onboarding")}
        >
          <Text style={styles.onboardingButtonText}>Learn More</Text>
        </TouchableOpacity>
      </View>

      {/* Main content */}
      <View style={[styles.content, { backgroundColor: colors.background }]}>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.title, { color: colors.text }]}>
            Welcome to encryptSIM
          </Text>
          <Text style={[styles.subtitle, { color: colors.text }]}>
            Secure VPN and eSIM services powered by Solana
          </Text>

          {/* Wallet Connection Section */}
          <View style={styles.walletSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Connect Your Wallet
            </Text>
            <Text style={[styles.sectionDescription, { color: colors.text }]}>
              Connect your Solana wallet to access secure VPN and eSIM services
            </Text>

            <WalletConnectionButton
              onConnected={handleWalletConnected}
              fullWidth
              style={styles.walletButton}
            />

            {/* Show account selector if wallet is connected */}
            <WalletAccountSelector />
          </View>

          {/* Divider */}
          <View style={styles.divider}>
            <View
              style={[styles.dividerLine, { backgroundColor: colors.border }]}
            />
            <Text style={[styles.dividerText, { color: colors.text }]}>or</Text>
            <View
              style={[styles.dividerLine, { backgroundColor: colors.border }]}
            />
          </View>

          {/* Legacy Options */}
          <View style={styles.legacySection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Alternative Options
            </Text>

            <View style={styles.actionButton}>
              <AppButton
                label="Create New Account"
                onPress={() => router.push("/login/account?state=create")}
              />
            </View>

            <View style={styles.actionButton}>
              <AppButton
                label="Import Existing Account"
                onPress={() => router.push("/login/account?state=login")}
                variant="secondary"
              />
            </View>
          </View>

          {/* Status Information */}
          {isWalletConnected && (
            <View
              style={[
                styles.statusInfo,
                { backgroundColor: colors.primary + "20" },
              ]}
            >
              <Text style={[styles.statusText, { color: colors.primary }]}>
                ✅ Wallet Connected
              </Text>
              {!deviceToken && (
                <Text style={[styles.statusSubtext, { color: colors.text }]}>
                  Creating device profile...
                </Text>
              )}
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  topBar: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logo: {
    width: 40,
    height: 40,
  },
  onboardingButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
  },
  onboardingButtonText: {
    color: "white",
    fontWeight: "600",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  card: {
    width: "100%",
    maxWidth: 400,
    padding: 24,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    opacity: 0.7,
    marginBottom: 32,
  },
  walletSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 16,
    lineHeight: 20,
  },
  walletButton: {
    marginBottom: 16,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    opacity: 0.5,
  },
  legacySection: {
    marginBottom: 24,
  },
  actionButton: {
    marginBottom: 12,
  },
  statusInfo: {
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
  },
  statusSubtext: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
  },
});
