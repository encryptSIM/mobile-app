import { AppButton } from "@/components/button";
import { addressFormatter } from "@/utils";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import * as Clipboard from "expo-clipboard";
import {
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native";
import { useBalance } from "@/hooks/balance";
import { useAuth } from "@/context/auth-context";

export default function ProfileScreen() {
  const { publicKey, setValue, deviceToken } = useAuth();
  const { balance, error, refreshBalance } = useBalance(publicKey || "");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  console.log("deviceToken", deviceToken);
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.screen}>
        {/* Profile Info */}
        <View style={styles.profileWrapper}>
          <View style={styles.profilePictureWrapper}>
            <View style={styles.profilePicture}>
              <Feather name="user" size={40} color="#00FFAA" />
            </View>
            <TouchableOpacity style={styles.editIcon}>
              <Feather name="edit-2" size={16} color="#0E1220" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={async () => {
              await Clipboard.setStringAsync(publicKey || "");
              ToastAndroid.show("Address copied!", ToastAndroid.SHORT);
            }}
            style={styles.addressButton}
          >
            <View style={styles.addressRow}>
              <Feather name="copy" size={16} color="#4ade80" />
              <Text style={styles.addressText}>
                {addressFormatter(publicKey || "")}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              refreshBalance();
            }}
            style={styles.balanceCard}
          >
            <Text style={styles.balanceLabel}>Current Balance</Text>
            <Text style={styles.balanceValue}>
              {error ? "Error" : `${balance?.toFixed(4)} SOL`}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          <Text style={styles.optionsTitle}>Options</Text>
          <View style={styles.optionsList}>
            <AppButton
              label="Order History"
              iconName="list"
              variant="moonlight"
              onPress={() => router.push("/profile/order-history")}
            />
            <AppButton
              label="Edit Profile"
              iconName="user"
              variant="moonlight"
              onPress={() => {}}
            />
            <AppButton
              label="Logout"
              iconName="log-out"
              variant="inactive"
              onPress={() => {
                setShowLogoutConfirm(true);
              }}
            />
          </View>
        </View>
      </View>
      <Modal
        transparent
        visible={showLogoutConfirm}
        animationType="fade"
        onRequestClose={() => setShowLogoutConfirm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm Logout</Text>
            <Text style={styles.modalMessage}>
              Please make sure you've written down your wallet address before
              logging out. You’ll need it to restore access to your account.
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => setShowLogoutConfirm(false)}
                style={[styles.modalButton, { backgroundColor: "#E2E8F0" }]}
              >
                <Text style={{ color: "#0E1220", fontWeight: "bold" }}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={async () => {
                  await setValue("");
                  setShowLogoutConfirm(false);
                  router.replace("/login");
                }}
                style={[styles.modalButton, { backgroundColor: "#EF4444" }]}
              >
                <Text style={{ color: "white", fontWeight: "bold" }}>
                  Logout
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0E1220",
  },
  screen: {
    flex: 1,
    paddingBottom: 20,
  },
  profileWrapper: {
    alignItems: "center",
    paddingTop: 24,
  },
  profilePictureWrapper: {
    position: "relative",
    marginBottom: 16,
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: "#00FFAA",
    backgroundColor: "#1E263C",
    justifyContent: "center",
    alignItems: "center",
  },
  editIcon: {
    position: "absolute",
    bottom: 4,
    right: 4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  addressButton: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#4ade80",
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  addressText: {
    color: "#4ade80",
    fontSize: 14,
    fontWeight: "500",
  },
  balanceCard: {
    backgroundColor: "#1E263C",
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    alignItems: "center",
    width: 200,
  },
  balanceLabel: {
    color: "#A0AEC0",
    fontSize: 12,
    marginBottom: 4,
  },
  balanceValue: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
  },
  optionsContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 32,
  },
  optionsTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
  },
  optionsList: {
    flex: 1,
    backgroundColor: "#1E263C",
    borderRadius: 16,
    padding: 16,
    justifyContent: "space-evenly",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: 300,
    backgroundColor: "#1E263C",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalMessage: {
    color: "#CBD5E1",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
});
