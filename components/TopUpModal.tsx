import React from "react";
import { Modal, View, Text, Pressable } from "react-native";
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
      <View className="flex-1 justify-center items-center bg-black/60">
        <View className="bg-white rounded-xl p-6 w-11/12 max-w-md">
          <Text className="text-lg font-bold mb-4 text-black">Top Up</Text>
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
          <View className="my-4">
            <Text className="text-black whitespace-pre-line">
              {planDetails}
            </Text>
          </View>
          <AppButton
            label="Buy"
            iconName="credit-card"
            variant="moonlight"
            onPress={onBuy}
          />
          <Pressable onPress={onClose} className="mt-4">
            <Text className="text-center text-gray-500">Cancel</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};
