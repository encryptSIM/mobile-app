import { Text, View } from "@/components/Themed";
import { AppButton } from "@/components/button";
import { useAsyncStorage } from "@/hooks/asyn-storage-hook";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import * as Clipboard from "expo-clipboard";
import { router } from "expo-router";
import { useSearchParams } from "expo-router/build/hooks";
import React, { useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";

export default function AccountScreen() {
  const {
    value: publicKey,
    loading,
    setValue,
  } = useAsyncStorage<string>("publicKey");

  const [copied, setCopied] = useState(false);
  const [customKey, setCustomKey] = useState("");
  const { colors } = useTheme();
  const params = useSearchParams();
  const isLoginState = params.get("state") === "login" && !publicKey;

  const handleCopy = async () => {
    if (!publicKey) return;
    await Clipboard.setStringAsync(publicKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmitCustomKey = async () => {
    const trimmed = customKey.trim();
    if (!trimmed) return;
    await setValue(trimmed);
    router.replace("/(tabs)/esim/package");
  };

  const handleContinue = () => {
    router.replace("/(tabs)/esim/package");
  };

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
            <AppButton
              label="Continue"
              iconName="arrow-right"
              variant="moonlight"
              showRightArrow={false}
              onPress={handleSubmitCustomKey}
            />
          </>
        ) : (
          <>
            <View style={styles.addressRow}>
              <Text
                style={[styles.accountText, { color: colors.text }]}
                numberOfLines={1}
              >
                {publicKey || "Not available"}
              </Text>
              {!!publicKey && (
                <TouchableOpacity
                  onPress={handleCopy}
                  style={[styles.copyBtn, { backgroundColor: colors.border }]}
                >
                  <Feather
                    name={copied ? "check" : "copy"}
                    size={18}
                    color={copied ? "#10B981" : colors.text}
                  />
                </TouchableOpacity>
              )}
            </View>

            {copied && (
              <Text style={[styles.copiedText, { color: "#10B981" }]}>
                Address copied to clipboard
              </Text>
            )}

            <AppButton
              label="Continue"
              iconName="arrow-right"
              variant="moonlight"
              showRightArrow={false}
              onPress={handleContinue}
            />
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
  headerText: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 24,
  },
  section: {
    width: "100%",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    gap: 20,
  },
  accountText: {
    fontSize: 14,
    flex: 1,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  copyBtn: {
    padding: 6,
    borderRadius: 6,
  },
  copiedText: {
    fontSize: 13,
    marginTop: -10,
  },
  inputBox: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginBottom: 12,
  },
});
