import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  TextInput,
  Modal,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { useSeedVault } from "@/hooks/use-seed-vault";
import { addressFormatter } from "@/utils";

interface SeedVaultManagerProps {
  onAccountSelect?: (account: any) => void;
  onClose?: () => void;
}

export const SeedVaultManager: React.FC<SeedVaultManagerProps> = ({
  onAccountSelect,
  onClose,
}) => {
  const { colors } = useTheme();
  const {
    isAvailable,
    isUnlocked,
    accounts,
    selectedAccount,
    loading,
    error,
    checkAvailability,
    unlock,
    lock,
    createAccount,
    importAccount,
    selectAccount,
    isDeviceSecure,
    enableBiometrics,
  } = useSeedVault();

  const [showImportModal, setShowImportModal] = useState(false);
  const [importMnemonic, setImportMnemonic] = useState("");
  const [importLabel, setImportLabel] = useState("");
  const [createLabel, setCreateLabel] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleUnlock = async () => {
    try {
      await unlock();
      Alert.alert("Success", "Seed Vault unlocked successfully");
    } catch (err: any) {
      Alert.alert("Unlock Failed", err.message);
    }
  };

  const handleLock = async () => {
    try {
      await lock();
      Alert.alert("Success", "Seed Vault locked");
    } catch (err: any) {
      Alert.alert("Lock Failed", err.message);
    }
  };

  const handleCreateAccount = async () => {
    try {
      const newAccount = await createAccount(createLabel || undefined);
      setCreateLabel("");
      setShowCreateModal(false);
      Alert.alert(
        "Account Created",
        `New account created: ${addressFormatter(
          newAccount.publicKey.toString()
        )}`
      );
    } catch (err: any) {
      Alert.alert("Creation Failed", err.message);
    }
  };

  const handleImportAccount = async () => {
    if (!importMnemonic.trim()) {
      Alert.alert("Error", "Please enter a valid mnemonic phrase");
      return;
    }

    try {
      const importedAccount = await importAccount(
        importMnemonic.trim(),
        importLabel || undefined
      );
      setImportMnemonic("");
      setImportLabel("");
      setShowImportModal(false);
      Alert.alert(
        "Account Imported",
        `Account imported: ${addressFormatter(
          importedAccount.publicKey.toString()
        )}`
      );
    } catch (err: any) {
      Alert.alert("Import Failed", err.message);
    }
  };

  const handleAccountSelect = (account: any) => {
    selectAccount(account);
    onAccountSelect?.(account);
    Alert.alert(
      "Account Selected",
      `Selected: ${account.label || "Unnamed Account"}\n${addressFormatter(
        account.publicKey.toString()
      )}`
    );
  };

  const handleEnableBiometrics = async () => {
    try {
      const success = await enableBiometrics();
      if (success) {
        Alert.alert("Success", "Biometric authentication enabled");
      }
    } catch (err: any) {
      Alert.alert("Biometrics Failed", err.message);
    }
  };

  const checkSecurity = async () => {
    try {
      const isSecure = await isDeviceSecure();
      Alert.alert(
        "Device Security",
        isSecure
          ? "Your device has secure lock screen protection"
          : "Please set up a secure lock screen (PIN, pattern, or biometric) for enhanced security"
      );
    } catch (err: any) {
      Alert.alert("Security Check Failed", err.message);
    }
  };

  if (!isAvailable) {
    return (
      <View style={[styles.container, { backgroundColor: colors.card }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            Seed Vault Manager
          </Text>
          {onClose && (
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Feather name="x" size={24} color={colors.text} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.unavailableContainer}>
          <Feather
            name="shield-off"
            size={48}
            color={colors.text}
            style={{ opacity: 0.5 }}
          />
          <Text style={[styles.unavailableTitle, { color: colors.text }]}>
            Seed Vault Not Available
          </Text>
          <Text style={[styles.unavailableText, { color: colors.text }]}>
            Seed Vault is only available on Solana Mobile devices (Saga, etc.)
            or the Solana Mobile emulator.
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            onPress={checkAvailability}
          >
            <Text style={styles.retryButtonText}>Check Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!isUnlocked) {
    return (
      <View style={[styles.container, { backgroundColor: colors.card }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            Seed Vault Manager
          </Text>
          {onClose && (
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Feather name="x" size={24} color={colors.text} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.lockedContainer}>
          <Feather name="lock" size={48} color={colors.primary} />
          <Text style={[styles.lockedTitle, { color: colors.text }]}>
            Seed Vault Locked
          </Text>
          <Text style={[styles.lockedText, { color: colors.text }]}>
            Unlock your Seed Vault to manage your secure accounts
          </Text>

          {error && (
            <Text style={[styles.errorText, { color: "red" }]}>{error}</Text>
          )}

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.unlockButton, { backgroundColor: colors.primary }]}
              onPress={handleUnlock}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Feather name="unlock" size={18} color="white" />
                  <Text style={styles.buttonText}>Unlock Vault</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.securityButton, { borderColor: colors.border }]}
              onPress={checkSecurity}
            >
              <Feather name="shield" size={18} color={colors.text} />
              <Text style={[styles.securityButtonText, { color: colors.text }]}>
                Check Security
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Seed Vault Manager
        </Text>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Feather name="x" size={24} color={colors.text} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content}>
        {/* Status Section */}
        <View
          style={[
            styles.statusSection,
            { backgroundColor: colors.primary + "20" },
          ]}
        >
          <View style={styles.statusRow}>
            <Feather name="unlock" size={16} color={colors.primary} />
            <Text style={[styles.statusText, { color: colors.primary }]}>
              Vault Unlocked
            </Text>
          </View>
          <Text style={[styles.statusSubtext, { color: colors.text }]}>
            {accounts.length} account{accounts.length !== 1 ? "s" : ""}{" "}
            available
          </Text>
        </View>

        {/* Accounts List */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Your Accounts
          </Text>

          {accounts.length === 0 ? (
            <View style={styles.emptyState}>
              <Feather
                name="user-plus"
                size={32}
                color={colors.text}
                style={{ opacity: 0.5 }}
              />
              <Text style={[styles.emptyText, { color: colors.text }]}>
                No accounts found. Create or import an account to get started.
              </Text>
            </View>
          ) : (
            accounts.map((account, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.accountItem,
                  {
                    borderColor: colors.border,
                    backgroundColor: selectedAccount?.publicKey.equals(
                      account.publicKey
                    )
                      ? colors.primary + "10"
                      : "transparent",
                  },
                ]}
                onPress={() => handleAccountSelect(account)}
              >
                <View style={styles.accountInfo}>
                  <Text style={[styles.accountLabel, { color: colors.text }]}>
                    {account.label}
                  </Text>
                  <Text style={[styles.accountAddress, { color: colors.text }]}>
                    {addressFormatter(account.publicKey.toString())}
                  </Text>
                  <Text style={[styles.accountPath, { color: colors.text }]}>
                    {account.derivationPath}
                  </Text>
                </View>
                {selectedAccount?.publicKey.equals(account.publicKey) && (
                  <Feather name="check" size={20} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Account Management
          </Text>

          <View style={styles.actionGrid}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.primary }]}
              onPress={() => setShowCreateModal(true)}
              disabled={loading}
            >
              <Feather name="plus" size={18} color="white" />
              <Text style={styles.actionButtonText}>Create Account</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.primary }]}
              onPress={() => setShowImportModal(true)}
              disabled={loading}
            >
              <Feather name="download" size={18} color="white" />
              <Text style={styles.actionButtonText}>Import Account</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.primary }]}
              onPress={handleEnableBiometrics}
              disabled={loading}
            >
              <Feather name="shield" size={18} color="white" />
              <Text style={styles.actionButtonText}>Enable Biometrics</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: "red" }]}
              onPress={handleLock}
              disabled={loading}
            >
              <Feather name="lock" size={18} color="white" />
              <Text style={styles.actionButtonText}>Lock Vault</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Create Account Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: colors.background },
          ]}
        >
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Create New Account
            </Text>
            <TouchableOpacity
              onPress={() => setShowCreateModal(false)}
              style={styles.modalClose}
            >
              <Feather name="x" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>
              Account Label (Optional)
            </Text>
            <TextInput
              style={[
                styles.textInput,
                { borderColor: colors.border, color: colors.text },
              ]}
              value={createLabel}
              onChangeText={setCreateLabel}
              placeholder="e.g., Trading Account"
              placeholderTextColor={colors.text + "60"}
            />

            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: colors.primary }]}
              onPress={handleCreateAccount}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.modalButtonText}>Create Account</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Import Account Modal */}
      <Modal
        visible={showImportModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowImportModal(false)}
      >
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: colors.background },
          ]}
        >
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Import Account
            </Text>
            <TouchableOpacity
              onPress={() => setShowImportModal(false)}
              style={styles.modalClose}
            >
              <Feather name="x" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>
              Mnemonic Phrase
            </Text>
            <TextInput
              style={[
                styles.textInput,
                styles.multilineInput,
                { borderColor: colors.border, color: colors.text },
              ]}
              value={importMnemonic}
              onChangeText={setImportMnemonic}
              placeholder="Enter your 12 or 24 word mnemonic phrase"
              placeholderTextColor={colors.text + "60"}
              multiline
              secureTextEntry
            />

            <Text style={[styles.inputLabel, { color: colors.text }]}>
              Account Label (Optional)
            </Text>
            <TextInput
              style={[
                styles.textInput,
                { borderColor: colors.border, color: colors.text },
              ]}
              value={importLabel}
              onChangeText={setImportLabel}
              placeholder="e.g., Imported Wallet"
              placeholderTextColor={colors.text + "60"}
            />

            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: colors.primary }]}
              onPress={handleImportAccount}
              disabled={loading || !importMnemonic.trim()}
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.modalButtonText}>Import Account</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  unavailableContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  unavailableTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  unavailableText: {
    fontSize: 14,
    textAlign: "center",
    opacity: 0.7,
    lineHeight: 20,
    marginBottom: 24,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  lockedContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  lockedTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  lockedText: {
    fontSize: 14,
    textAlign: "center",
    opacity: 0.7,
    lineHeight: 20,
    marginBottom: 24,
  },
  errorText: {
    fontSize: 12,
    textAlign: "center",
    marginBottom: 16,
  },
  actionButtons: {
    width: "100%",
    gap: 12,
  },
  unlockButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  securityButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  securityButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  statusSection: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 16,
    fontWeight: "600",
  },
  statusSubtext: {
    fontSize: 12,
    opacity: 0.7,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
    opacity: 0.7,
    marginTop: 12,
    lineHeight: 20,
  },
  accountItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderWidth: 1,
    borderRadius: 8,
    marginVertical: 4,
  },
  accountInfo: {
    flex: 1,
  },
  accountLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  accountAddress: {
    fontSize: 12,
    fontFamily: "monospace",
    marginBottom: 2,
  },
  accountPath: {
    fontSize: 10,
    opacity: 0.6,
  },
  actionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    minWidth: "45%",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  actionButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  modalContainer: {
    flex: 1,
    paddingTop: 50,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  modalClose: {
    padding: 4,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 16,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: "top",
  },
  modalButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 24,
  },
  modalButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
