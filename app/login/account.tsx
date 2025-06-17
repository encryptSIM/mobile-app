import { Text, View } from "@/components/Themed";
import { AppButton } from "@/components/button";
import { useAuth } from "@/context/auth-context";
import { createPaymentProfile } from "@/service/auth";
import { errorLog } from "@/service/error-log";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import * as Clipboard from "expo-clipboard";
import { router } from "expo-router";
import { useSearchParams } from "expo-router/build/hooks";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";

export default function AccountScreen() {
  const { publicKey, loading, setValue } = useAuth();
  const [step, setStep] = useState<"view" | "confirm">("view");
  const [copied, setCopied] = useState(false);
  const [customKey, setCustomKey] = useState("");
  const [fetchedKey, setFetchedKey] = useState("");
  console.log("customKey", customKey);
  const [confirmKey, setConfirmKey] = useState("");
  const { colors } = useTheme();
  const params = useSearchParams();
  const isLoginState = params.get("state") === "login";

  const handleCopy = async () => {
    if (!fetchedKey) return;
    await Clipboard.setStringAsync(fetchedKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreatePaymentProfile = async () => {
    try {
      const response = await createPaymentProfile();
      const pk = response.data?.publicKey;
      if (pk) {
        setFetchedKey(pk);
      }
    } catch (error) {
      await errorLog(error as Error);
      console.error("Error creating payment profile:", error);
    }
  };

  const handleSubmitCustomKey = async () => {
    const trimmed = customKey.trim();
    if (!trimmed) return;
    await setValue(trimmed);
    router.replace("/(tabs)/esim/package");
  };

  const handleContinue = async () => {
    if (!confirmKey || confirmKey !== fetchedKey) return;
    await setValue(fetchedKey);
    router.replace("/(tabs)/esim/package");
  };

  useEffect(() => {
    if (params.get("state") === "create" && !fetchedKey) {
      handleCreatePaymentProfile();
    }
  }, [params.get("state")]);

  if (loading) {
    return (
      <SafeAreaView
        style={[
          styles.centeredContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={colors.text} />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Loading your account...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <View style={styles.container}>
        {isLoginState ? (
          <>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Enter your address
            </Text>
            <TextInput
              style={[
                styles.inputBox,
                { color: colors.text, borderColor: colors.border },
              ]}
              placeholder="Paste your public key"
              placeholderTextColor={colors.border}
              value={customKey}
              onChangeText={setCustomKey}
              autoCapitalize="none"
            />
            <View style={styles.buttonGroup}>
              <AppButton
                label="Continue"
                iconName="arrow-right"
                variant="moonlight"
                showRightArrow={false}
                onPress={handleSubmitCustomKey}
              />
              <AppButton
                label="Go back"
                iconName="arrow-left"
                variant="inactive"
                showRightArrow={false}
                onPress={() => router.replace("/login")}
              />
            </View>
          </>
        ) : step === "view" ? (
          <>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Your Public Address
            </Text>
            <View style={styles.addressContainer}>
              <Text
                style={[styles.accountText, { color: "#111827" }]}
                numberOfLines={1}
              >
                {fetchedKey || "Not available"}
              </Text>
              {!!fetchedKey && (
                <TouchableOpacity
                  onPress={handleCopy}
                  style={styles.copyButton}
                >
                  <Feather
                    name={copied ? "check" : "copy"}
                    size={16}
                    color={copied ? "#10B981" : "#111827"}
                  />
                </TouchableOpacity>
              )}
            </View>
            {copied && (
              <Text style={[styles.copiedText, { color: "#10B981" }]}>
                Address copied to clipboard
              </Text>
            )}
            <View style={styles.buttonGroup}>
              <AppButton
                label="Continue"
                iconName="arrow-right"
                variant="moonlight"
                showRightArrow={false}
                onPress={() => setStep("confirm")}
              />
              <AppButton
                label="Go back"
                iconName="arrow-left"
                variant="inactive"
                showRightArrow={false}
                onPress={() => router.replace("/login")}
              />
            </View>
          </>
        ) : (
          <>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Confirm you've written down your public address
            </Text>
            <TextInput
              style={[
                styles.inputBox,
                { color: colors.text, borderColor: colors.border },
              ]}
              placeholder="Enter your written down public key"
              placeholderTextColor={colors.border}
              value={confirmKey}
              onChangeText={setConfirmKey}
              autoCapitalize="none"
            />
            <View style={styles.buttonGroup}>
              <AppButton
                label="Go back to your address"
                iconName="arrow-left"
                variant="moonlight"
                showRightArrow={false}
                onPress={() => setStep("view")}
              />
              <AppButton
                label="Confirm & Proceed"
                iconName="check-circle"
                variant="moonlight"
                isDisabled={
                  confirmKey.trim().toLowerCase() !== fetchedKey?.toLowerCase()
                }
                showRightArrow={false}
                onPress={handleContinue}
              />
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  inputBox: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    marginBottom: 20,
  },
  accountText: {
    fontSize: 14,
    flex: 1,
    fontWeight: "500",
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  copyButton: {
    backgroundColor: "#E2E8F0",
    padding: 8,
    borderRadius: 8,
  },
  copiedText: {
    fontSize: 13,
    marginTop: -4,
    marginBottom: 16,
    textAlign: "center",
  },
  buttonGroup: {
    gap: 12,
  },
});
