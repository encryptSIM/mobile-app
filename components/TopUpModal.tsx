import { createTopUp, getTopUpOptions } from "@/service/payment";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { AppButton } from "./button";
import DropdownSelector from "./dropdown";
import { useRouter } from "expo-router";

interface TopUpModalProps {
  iccid: string;
  visible: boolean;
  onClose: () => void;
  selectedData: string;
  setSelectedData: (val: string) => void;
  selectedDay: string;
  setSelectedDay: (val: string) => void;
  ppPublicKey: string;
  onSelectPackage?: (packageDetails: {
    id: string;
    price: string;
    data: string;
    day: number;
  }) => void;
}

export const TopUpModal: React.FC<TopUpModalProps> = ({
  iccid,
  visible,
  onClose,
  selectedData,
  setSelectedData,
  selectedDay,
  setSelectedDay,
  ppPublicKey,
  onSelectPackage,
}) => {
  const [topUpOptions, setTopUpOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (visible && iccid) {
      setLoading(true);
      getTopUpOptions(iccid)
        .then((res) => {
          setTopUpOptions(res.data);
          // Default select the first option
          if (res.data.length > 0) {
            setSelectedOptionId(res.data[0].id);
            setSelectedData(res.data[0].data);
            setSelectedDay(res.data[0].day.toString());
          }
        })
        .finally(() => setLoading(false));
    }
  }, [visible, iccid, setSelectedData, setSelectedDay]);

  const selectedOption = topUpOptions.find(
    (opt) => opt.id === selectedOptionId
  );

  const dropdownOptions = topUpOptions.map((option) => ({
    label: `${option.title} - $${option.price}`,
    value: option.id,
  }));

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
          {loading ? (
            <ActivityIndicator size="large" color="#00FFAA" />
          ) : (
            <>
              {topUpOptions.length === 0 ? (
                <Text>No top-up options available.</Text>
              ) : (
                <DropdownSelector
                  label="Top-up Plan"
                  selectedValue={selectedOptionId ?? ""}
                  onValueChange={(val) => {
                    setSelectedOptionId(val);
                    const selected = topUpOptions.find((opt) => opt.id === val);
                    if (selected) {
                      setSelectedData(selected.data);
                      setSelectedDay(selected.day.toString());
                    }
                  }}
                  options={dropdownOptions}
                />
              )}
              {selectedOption && (
                <View style={styles.detailsBox}>
                  <Text style={styles.detailsText}>
                    Data: {selectedOption.data}
                    {"\n"}
                    Duration: {selectedOption.day} days{"\n"}
                    Price: ${selectedOption.price}
                  </Text>
                </View>
              )}
              <AppButton
                label="Buy"
                iconName="credit-card"
                variant="moonlight"
                onPress={async () => {
                  if (!selectedOption) return;
                  try {
                    setProcessing(true);
                    const response = await createTopUp({
                      ppPublicKey,
                      package_id: selectedOption.id,
                      iccid,
                      package_price: selectedOption.price.toString(),
                    });
                    onClose();
                    // Call onSelectPackage with the selected package details
                    onSelectPackage?.({
                      id: selectedOption.id,
                      price: selectedOption.price.toString(),
                      data: selectedOption.data,
                      day: selectedOption.day,
                    });
                  } catch (error) {
                    console.error("Failed to create top-up:", error);
                    // You might want to show an error message to the user here
                  } finally {
                    setProcessing(false);
                  }
                }}
                isDisabled={!selectedOption || processing}
              />
            </>
          )}
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
  option: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    marginBottom: 8,
  },
  selectedOption: {
    backgroundColor: "#A7F3D0",
  },
  optionText: {
    color: "#111",
    fontSize: 16,
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
    color: "#6B7280",
  },
});
