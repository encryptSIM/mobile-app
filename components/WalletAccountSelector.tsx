import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { useAuth } from "@/context/auth-context";
import { addressFormatter } from "@/utils";
import type { Account } from "@/hooks/use-mobile-wallet";

interface WalletAccountSelectorProps {
  onAccountSelect?: (account: Account) => void;
}

export const WalletAccountSelector: React.FC<WalletAccountSelectorProps> = ({
  onAccountSelect,
}) => {
  const { colors } = useTheme();
  const { wallet, isWalletConnected } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);

  if (
    !isWalletConnected ||
    !wallet.authorizedWallet ||
    wallet.authorizedWallet.accounts.length <= 1
  ) {
    return null; // Don't show selector if not connected or only one account
  }

  const { accounts, selectedAccount } = wallet.authorizedWallet;

  const handleAccountSelect = (account: Account) => {
    // Note: In a real implementation, you'd need to update the selected account
    // This might require re-authorization or account switching logic
    setModalVisible(false);
    onAccountSelect?.(account);

    Alert.alert(
      "Account Selection",
      "Account switching is not fully implemented yet. This would typically require re-authorization with the wallet.",
      [{ text: "OK" }]
    );
  };

  const openSelector = () => {
    setModalVisible(true);
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.selectorButton, { borderColor: colors.border }]}
        onPress={openSelector}
      >
        <View style={styles.selectedAccountInfo}>
          <Text style={[styles.selectedAccountLabel, { color: colors.text }]}>
            Selected Account
          </Text>
          <Text style={[styles.selectedAccountAddress, { color: colors.text }]}>
            {addressFormatter(selectedAccount.address)}
          </Text>
          {selectedAccount.label && (
            <Text style={[styles.selectedAccountName, { color: colors.text }]}>
              {selectedAccount.label}
            </Text>
          )}
        </View>
        <Feather name="chevron-down" size={20} color={colors.text} />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: colors.background },
          ]}
        >
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Select Account
            </Text>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.closeButton}
            >
              <Feather name="x" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.accountsList}>
            {accounts.map((account, index) => {
              const isSelected = account.address === selectedAccount.address;

              return (
                <TouchableOpacity
                  key={account.address}
                  style={[
                    styles.accountItem,
                    {
                      borderColor: colors.border,
                      backgroundColor: isSelected
                        ? colors.primary + "20"
                        : "transparent",
                    },
                  ]}
                  onPress={() => handleAccountSelect(account)}
                >
                  <View style={styles.accountItemContent}>
                    <View style={styles.accountItemInfo}>
                      <Text
                        style={[
                          styles.accountItemAddress,
                          { color: colors.text },
                        ]}
                      >
                        {addressFormatter(account.address)}
                      </Text>
                      {account.label && (
                        <Text
                          style={[
                            styles.accountItemLabel,
                            { color: colors.text },
                          ]}
                        >
                          {account.label}
                        </Text>
                      )}
                      <Text
                        style={[
                          styles.accountItemIndex,
                          { color: colors.text },
                        ]}
                      >
                        Account {index + 1}
                      </Text>
                    </View>
                    {isSelected && (
                      <Feather name="check" size={20} color={colors.primary} />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={styles.modalFooter}>
            <Text style={[styles.footerText, { color: colors.text }]}>
              {accounts.length} account{accounts.length !== 1 ? "s" : ""}{" "}
              available
            </Text>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  selectorButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderWidth: 1,
    borderRadius: 8,
    marginVertical: 8,
  },
  selectedAccountInfo: {
    flex: 1,
  },
  selectedAccountLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 2,
  },
  selectedAccountAddress: {
    fontSize: 14,
    fontFamily: "monospace",
    fontWeight: "600",
  },
  selectedAccountName: {
    fontSize: 12,
    marginTop: 2,
    opacity: 0.8,
  },
  modalContainer: {
    flex: 1,
    paddingTop: 50,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  closeButton: {
    padding: 4,
  },
  accountsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  accountItem: {
    borderWidth: 1,
    borderRadius: 8,
    marginVertical: 4,
    overflow: "hidden",
  },
  accountItemContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  accountItemInfo: {
    flex: 1,
  },
  accountItemAddress: {
    fontSize: 14,
    fontFamily: "monospace",
    fontWeight: "600",
  },
  accountItemLabel: {
    fontSize: 12,
    marginTop: 2,
    opacity: 0.8,
  },
  accountItemIndex: {
    fontSize: 11,
    marginTop: 4,
    opacity: 0.6,
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.1)",
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    opacity: 0.7,
  },
});
