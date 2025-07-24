import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  TextInput,
  Switch,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

interface DappStoreConfigProps {
  onClose?: () => void;
}

export const DappStoreConfig: React.FC<DappStoreConfigProps> = ({
  onClose,
}) => {
  const { colors } = useTheme();

  // Publisher Information
  const [publisherName, setPublisherName] = useState("");
  const [publisherWebsite, setPublisherWebsite] = useState("");
  const [publisherEmail, setPublisherEmail] = useState("");

  // App Information
  const [appName, setAppName] = useState("encryptSIM");
  const [androidPackage, setAndroidPackage] = useState(
    "com.giachan2002.encryptsim"
  );
  const [appWebsite, setAppWebsite] = useState("https://encryptsim.com");
  const [privacyPolicyUrl, setPrivacyPolicyUrl] = useState("");
  const [licenseUrl, setLicenseUrl] = useState("");

  // Release Information
  const [shortDescription, setShortDescription] = useState("");
  const [longDescription, setLongDescription] = useState("");
  const [newInVersion, setNewInVersion] = useState("");
  const [sagaFeatures, setSagaFeatures] = useState("");
  const [testingInstructions, setTestingInstructions] = useState("");

  // Testing Configuration
  const [alphaTesters, setAlphaTesters] = useState([
    { address: "", comment: "" },
  ]);

  const addAlphaTester = () => {
    setAlphaTesters([...alphaTesters, { address: "", comment: "" }]);
  };

  const removeAlphaTester = (index: number) => {
    const updated = alphaTesters.filter((_, i) => i !== index);
    setAlphaTesters(updated);
  };

  const updateAlphaTester = (
    index: number,
    field: "address" | "comment",
    value: string
  ) => {
    const updated = [...alphaTesters];
    updated[index][field] = value;
    setAlphaTesters(updated);
  };

  const generateConfigYaml = () => {
    const config = `# dApp Store Configuration for encryptSIM
# Generated on ${new Date().toISOString()}

publisher:
  name: ${publisherName || "<<YOUR_PUBLISHER_NAME>>"}
  address: ''
  website: ${publisherWebsite || "<<URL_OF_PUBLISHER_WEBSITE>>"}
  email: ${publisherEmail || "<<EMAIL_ADDRESS_TO_CONTACT_PUBLISHER>>"}
  media:
    - purpose: icon
      uri: assets/app-logo.png

app:
  name: ${appName}
  address: ''
  android_package: ${androidPackage}
  urls:
    license_url: ${licenseUrl || "<<URL_OF_APP_LICENSE_OR_TERMS_OF_SERVICE>>"}
    copyright_url: ${appWebsite || "<<URL_OF_COPYRIGHT_DETAILS_FOR_APP>>"}
    privacy_policy_url: ${privacyPolicyUrl || "<<URL_OF_APP_PRIVACY_POLICY>>"}
    website: ${appWebsite}
  media:
    - purpose: icon
      uri: assets/app-logo.png

release:
  address: ''
  media:
    - purpose: icon
      uri: assets/app-logo.png
    - purpose: banner
      uri: assets/images/banner.png
    - purpose: featureGraphic
      uri: assets/images/feature-graphic.png
    - purpose: screenshot
      uri: assets/images/screenshot1.png
    - purpose: screenshot
      uri: assets/images/screenshot2.png
    - purpose: screenshot
      uri: assets/images/screenshot3.png
    - purpose: screenshot
      uri: assets/images/screenshot4.png
  files:
    - purpose: install
      uri: app-release.apk
  catalog:
    en-US:
      name: ${appName}
      short_description: ${
        shortDescription || "Secure VPN and eSIM services powered by Solana"
      }
      long_description: ${
        longDescription ||
        "encryptSIM provides secure decentralized VPN (dVPN) services and global eSIM connectivity powered by the Solana blockchain. Features include: Mobile Wallet Adapter integration, Seed Vault secure key storage, WireGuard VPN protocol, global eSIM coverage in 138+ countries, and no-KYC crypto payments."
      }
      new_in_version: ${
        newInVersion || "Initial release with Mobile Wallet Adapter integration"
      }
      saga_features: ${
        sagaFeatures ||
        "Seed Vault integration for secure key management, enhanced mobile wallet connectivity"
      }

solana_mobile_dapp_publisher_portal:
  google_store_package: ${androidPackage}
  testing_instructions: ${
    testingInstructions ||
    "Test wallet connection with multiple Solana wallets (Phantom, Solflare). Test VPN connectivity and eSIM activation. Verify transaction signing and payments."
  }
  alpha_testers:${alphaTesters
    .map(
      (tester) => `
    - address: ${tester.address || "<<genesis token wallet address>>"}
      comment: ${tester.comment || "Optional. For internal use only"}`
    )
    .join("")}
`;

    return config;
  };

  const saveConfig = async () => {
    try {
      const config = generateConfigYaml();
      const fileUri = FileSystem.documentDirectory + "config.yaml";

      await FileSystem.writeAsStringAsync(fileUri, config);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          dialogTitle: "Save dApp Store Configuration",
          mimeType: "text/yaml",
        });
      }

      Alert.alert(
        "Configuration Generated",
        "Your dApp Store configuration file has been generated and saved.",
        [{ text: "OK" }]
      );
    } catch (error) {
      console.error("Error saving config:", error);
      Alert.alert("Error", "Failed to save configuration file");
    }
  };

  const validateConfig = () => {
    const missing = [];

    if (!publisherName) missing.push("Publisher Name");
    if (!publisherEmail) missing.push("Publisher Email");
    if (!publisherWebsite) missing.push("Publisher Website");
    if (!shortDescription) missing.push("Short Description");
    if (!longDescription) missing.push("Long Description");
    if (!privacyPolicyUrl) missing.push("Privacy Policy URL");
    if (!licenseUrl) missing.push("License URL");

    if (missing.length > 0) {
      Alert.alert(
        "Incomplete Configuration",
        `Please fill in the following required fields:\n\n${missing.join(
          "\n"
        )}`,
        [{ text: "OK" }]
      );
      return false;
    }

    return true;
  };

  const previewConfig = () => {
    const config = generateConfigYaml();
    Alert.alert("Configuration Preview", config.substring(0, 500) + "...", [
      { text: "Close", style: "cancel" },
      { text: "Save Full Config", onPress: saveConfig },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          dApp Store Configuration
        </Text>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Feather name="x" size={24} color={colors.text} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Publisher Information */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Publisher Information
          </Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>
              Publisher Name *
            </Text>
            <TextInput
              style={[
                styles.textInput,
                { borderColor: colors.border, color: colors.text },
              ]}
              value={publisherName}
              onChangeText={setPublisherName}
              placeholder="Your company or organization name"
              placeholderTextColor={colors.text + "60"}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>
              Publisher Website *
            </Text>
            <TextInput
              style={[
                styles.textInput,
                { borderColor: colors.border, color: colors.text },
              ]}
              value={publisherWebsite}
              onChangeText={setPublisherWebsite}
              placeholder="https://yourcompany.com"
              placeholderTextColor={colors.text + "60"}
              keyboardType="url"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>
              Publisher Email *
            </Text>
            <TextInput
              style={[
                styles.textInput,
                { borderColor: colors.border, color: colors.text },
              ]}
              value={publisherEmail}
              onChangeText={setPublisherEmail}
              placeholder="contact@yourcompany.com"
              placeholderTextColor={colors.text + "60"}
              keyboardType="email-address"
            />
          </View>
        </View>

        {/* App Information */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            App Information
          </Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>
              App Name
            </Text>
            <TextInput
              style={[
                styles.textInput,
                { borderColor: colors.border, color: colors.text },
              ]}
              value={appName}
              onChangeText={setAppName}
              placeholder="Your app name"
              placeholderTextColor={colors.text + "60"}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>
              Android Package Name
            </Text>
            <TextInput
              style={[
                styles.textInput,
                { borderColor: colors.border, color: colors.text },
              ]}
              value={androidPackage}
              onChangeText={setAndroidPackage}
              placeholder="com.company.appname"
              placeholderTextColor={colors.text + "60"}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>
              App Website
            </Text>
            <TextInput
              style={[
                styles.textInput,
                { borderColor: colors.border, color: colors.text },
              ]}
              value={appWebsite}
              onChangeText={setAppWebsite}
              placeholder="https://yourapp.com"
              placeholderTextColor={colors.text + "60"}
              keyboardType="url"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>
              Privacy Policy URL *
            </Text>
            <TextInput
              style={[
                styles.textInput,
                { borderColor: colors.border, color: colors.text },
              ]}
              value={privacyPolicyUrl}
              onChangeText={setPrivacyPolicyUrl}
              placeholder="https://yourapp.com/privacy"
              placeholderTextColor={colors.text + "60"}
              keyboardType="url"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>
              License/Terms URL *
            </Text>
            <TextInput
              style={[
                styles.textInput,
                { borderColor: colors.border, color: colors.text },
              ]}
              value={licenseUrl}
              onChangeText={setLicenseUrl}
              placeholder="https://yourapp.com/terms"
              placeholderTextColor={colors.text + "60"}
              keyboardType="url"
            />
          </View>
        </View>

        {/* Release Information */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Release Information
          </Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>
              Short Description *
            </Text>
            <TextInput
              style={[
                styles.textInput,
                { borderColor: colors.border, color: colors.text },
              ]}
              value={shortDescription}
              onChangeText={setShortDescription}
              placeholder="Brief description of your app (max 80 characters)"
              placeholderTextColor={colors.text + "60"}
              maxLength={80}
            />
            <Text style={[styles.charCount, { color: colors.text }]}>
              {shortDescription.length}/80
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>
              Long Description *
            </Text>
            <TextInput
              style={[
                styles.textInput,
                styles.multilineInput,
                { borderColor: colors.border, color: colors.text },
              ]}
              value={longDescription}
              onChangeText={setLongDescription}
              placeholder="Detailed description of your app's features and benefits"
              placeholderTextColor={colors.text + "60"}
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>
              What's New in This Version
            </Text>
            <TextInput
              style={[
                styles.textInput,
                styles.multilineInput,
                { borderColor: colors.border, color: colors.text },
              ]}
              value={newInVersion}
              onChangeText={setNewInVersion}
              placeholder="Describe the new features in this version"
              placeholderTextColor={colors.text + "60"}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>
              Saga-Specific Features
            </Text>
            <TextInput
              style={[
                styles.textInput,
                styles.multilineInput,
                { borderColor: colors.border, color: colors.text },
              ]}
              value={sagaFeatures}
              onChangeText={setSagaFeatures}
              placeholder="Features that are only available on Solana Mobile devices"
              placeholderTextColor={colors.text + "60"}
              multiline
              numberOfLines={2}
            />
          </View>
        </View>

        {/* Testing Configuration */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Testing Configuration
          </Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>
              Testing Instructions
            </Text>
            <TextInput
              style={[
                styles.textInput,
                styles.multilineInput,
                { borderColor: colors.border, color: colors.text },
              ]}
              value={testingInstructions}
              onChangeText={setTestingInstructions}
              placeholder="Instructions for testing your app"
              placeholderTextColor={colors.text + "60"}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>
                Alpha Testers
              </Text>
              <TouchableOpacity
                onPress={addAlphaTester}
                style={[styles.addButton, { backgroundColor: colors.primary }]}
              >
                <Feather name="plus" size={16} color="white" />
                <Text style={styles.addButtonText}>Add Tester</Text>
              </TouchableOpacity>
            </View>

            {alphaTesters.map((tester, index) => (
              <View key={index} style={styles.testerGroup}>
                <View style={styles.testerHeader}>
                  <Text style={[styles.testerTitle, { color: colors.text }]}>
                    Tester {index + 1}
                  </Text>
                  {alphaTesters.length > 1 && (
                    <TouchableOpacity
                      onPress={() => removeAlphaTester(index)}
                      style={styles.removeButton}
                    >
                      <Feather name="trash-2" size={16} color="red" />
                    </TouchableOpacity>
                  )}
                </View>

                <TextInput
                  style={[
                    styles.textInput,
                    { borderColor: colors.border, color: colors.text },
                  ]}
                  value={tester.address}
                  onChangeText={(value) =>
                    updateAlphaTester(index, "address", value)
                  }
                  placeholder="Solana wallet address"
                  placeholderTextColor={colors.text + "60"}
                />

                <TextInput
                  style={[
                    styles.textInput,
                    {
                      borderColor: colors.border,
                      color: colors.text,
                      marginTop: 8,
                    },
                  ]}
                  value={tester.comment}
                  onChangeText={(value) =>
                    updateAlphaTester(index, "comment", value)
                  }
                  placeholder="Comment (optional)"
                  placeholderTextColor={colors.text + "60"}
                />
              </View>
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={previewConfig}
          >
            <Feather name="eye" size={18} color="white" />
            <Text style={styles.actionButtonText}>Preview Config</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={() => {
              if (validateConfig()) {
                saveConfig();
              }
            }}
          >
            <Feather name="download" size={18} color="white" />
            <Text style={styles.actionButtonText}>Generate & Save</Text>
          </TouchableOpacity>
        </View>

        {/* Information Box */}
        <View
          style={[styles.infoBox, { backgroundColor: colors.primary + "20" }]}
        >
          <Feather name="info" size={16} color={colors.primary} />
          <View style={styles.infoContent}>
            <Text style={[styles.infoTitle, { color: colors.primary }]}>
              dApp Store Submission
            </Text>
            <Text style={[styles.infoText, { color: colors.text }]}>
              After generating your config.yaml file, you'll need to prepare
              additional assets:
              {"\n"}• App icons (various sizes)
              {"\n"}• Screenshots (at least 4)
              {"\n"}• Banner and feature graphics
              {"\n"}• Signed APK file
              {"\n\n"}
              Visit the Solana Mobile dApp Store Publisher Portal for submission
              guidelines.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 12,
    margin: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
  },
  multilineInput: {
    height: 80,
    textAlignVertical: "top",
  },
  charCount: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 4,
    textAlign: "right",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  addButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  testerGroup: {
    padding: 12,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    borderRadius: 8,
    marginBottom: 12,
  },
  testerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  testerTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  removeButton: {
    padding: 4,
  },
  actionSection: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 8,
    gap: 8,
  },
  actionButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  infoBox: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    lineHeight: 16,
    opacity: 0.8,
  },
});
