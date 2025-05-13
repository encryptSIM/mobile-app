import React from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  Dimensions,
} from "react-native";
import DropdownSelector from "./dropdown";
import { AppButton } from "./button";

interface TopUpModalProps {
  visible: boolean;
  onClose: () => void;
  selectedData: string;
  setSelectedData: (val: string) => void;
  selectedDay: string;
  setSelectedDay: (val: string) => void;
  onBuy: () => void;
}

const dataOptions = [
  { label: "1GB", value: "1GB" },
  { label: "3GB", value: "3GB" },
  { label: "5GB", value: "5GB" },
];
const dayOptions = [
  { label: "3 Days", value: "3" },
  { label: "7 Days", value: "7" },
  { label: "30 Days", value: "30" },
];

export const TopUpModal: React.FC<TopUpModalProps> = ({
  visible,
  onClose,
  selectedData,
  setSelectedData,
  selectedDay,
  setSelectedDay,
  onBuy,
}) => {
  const planDetails = `Package: Asia\nData: ${selectedData}\nDuration: ${selectedDay} days\nPrice: $9.99`;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Top Up</Text>
          <DropdownSelector
            label="Data Size"
            selectedValue={selectedData}
            onValueChange={setSelectedData}
            options={dataOptions}
          />
          <DropdownSelector
            label="Day"
            selectedValue={selectedDay}
            onValueChange={setSelectedDay}
            options={dayOptions}
          />
          <View style={styles.detailsBox}>
            <Text style={styles.detailsText}>{planDetails}</Text>
          </View>
          <AppButton
            label="Buy"
            iconName="credit-card"
            variant="moonlight"
            onPress={onBuy}
          />
          <Pressable onPress={onClose} style={styles.cancelButton}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "92%",
    maxWidth: 400,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 16,
  },
  detailsBox: {
    marginVertical: 16,
  },
  detailsText: {
    color: "#000",
  },
  cancelButton: {
    marginTop: 16,
  },
  cancelText: {
    textAlign: "center",
    color: "#6B7280", // Tailwind's gray-500
  },
});
