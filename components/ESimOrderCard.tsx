import { AppButton } from "@/components/button";
import { View, Text } from "react-native";
import React from "react";

interface ESimOrder {
  id: number;
  region: string;
  status: string;
  dataUsed: number;
  dataLimit: number;
}

interface ESimOrderCardProps {
  order: ESimOrder;
  index: number;
  onBuyMoreData: () => void;
}

export const ESimOrderCard: React.FC<ESimOrderCardProps> = ({
  order,
  index,
  onBuyMoreData,
}) => {
  return (
    <View className="mb-4 bg-[#1E263C] rounded-2xl p-5 shadow-md border border-[#2A3550]">
      {/* Header Row with Order Label and ID */}
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-white text-lg font-semibold">
          📄 Order #{index + 1}
        </Text>
        <Text className="text-xs text-gray-400">#ID: {order.id}</Text>
      </View>

      {/* Status and Package Chips */}
      <View className="flex-row space-x-2 mb-4">
        <View className="bg-[#2E3B55] px-3 py-1 rounded-full">
          <Text className="text-sm text-white">🌏 {order.region} Package</Text>
        </View>
        <View className="bg-green-600 px-3 py-1 rounded-full">
          <Text className="text-sm text-white">🟢 {order.status}</Text>
        </View>
      </View>

      {/* Optional Data Progress Bar */}
      {/* 
      <View className="h-2 bg-gray-700 rounded-full mb-4">
        <View
          className="h-2 bg-blue-500 rounded-full"
          style={{ width: `${(order.dataUsed / order.dataLimit) * 100}%` }}
        />
      </View>
      */}

      {/* CTA Button */}
      <AppButton
        label="Buy More Data"
        iconName="plus-circle"
        variant="moonlight"
        onPress={onBuyMoreData}
      />
    </View>
  );
};
