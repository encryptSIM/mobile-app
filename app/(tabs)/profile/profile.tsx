import { AppButton } from "@/components/button";
import { TopUpModal } from "@/components/TopUpModal";
import { useAsyncStorage } from "@/hooks/asyn-storage-hook";
import { addressFormatter } from "@/utils";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { SafeAreaView, ScrollView, Text, View } from "react-native";

export default function ProfileScreen() {
  const { value: address, setValue } = useAsyncStorage<string>("publicKey");

  // Top-up modal state
  const [showTopup, setShowTopup] = React.useState(false);
  const [selectedData, setSelectedData] = React.useState("1GB");
  const [selectedDay, setSelectedDay] = React.useState("3");

  // Placeholder options
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

  // Placeholder plan details
  const planDetails = `Package: Asia\nData: ${selectedData}\nDuration: ${selectedDay} days\nPrice: $9.99`;

  return (
    <SafeAreaView className="flex-1 bg-[#0E1220]">
      {/* Top-up Modal */}
      <TopUpModal
        visible={showTopup}
        onClose={() => setShowTopup(false)}
        selectedData={selectedData}
        setSelectedData={setSelectedData}
        selectedDay={selectedDay}
        setSelectedDay={setSelectedDay}
        onBuy={() => {
          // Handle buy logic here
          setShowTopup(false);
        }}
      />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Profile Info */}
        <View className="items-center mt-6">
          {/* Profile Picture with overlay */}
          <View className="relative">
            <View className="w-24 h-24 rounded-full bg-black/30 items-center justify-center">
              <Feather name="camera" size={28} color="#00FFAA" />
            </View>
            <View className="absolute -bottom-2 -right-2 w-9 h-9 rounded-full bg-white items-center justify-center border border-gray-200">
              <Feather name="camera" size={20} color="#0E1220" />
            </View>
          </View>

          {/* Email */}
          <View className="mt-4 border border-green-400 rounded-full px-4 py-1">
            <Text className="text-green-400 text-sm">
              {addressFormatter(address || "")}
            </Text>
          </View>
        </View>

        {/* Options */}
        <View className="px-4 mt-10 space-y-4">
          <Text className="text-white text-base mb-2">Options</Text>
          {/* Option Buttons */}
          <View className="gap-4 flex flex-col">
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
            {/* <AppButton
              label="Change Password"
              iconName="lock"
              variant="moonlight"
              onPress={() => {}}
            /> */}
            {/* Logout */}
            <AppButton
              label="Logout"
              iconName="log-out"
              variant="inactive"
              onPress={() => {
                setValue("");
                router.replace("/login");
              }}
            />
          </View>
        </View>

        {/* eSIM Orders Section */}
        <View className="px-4 mt-10">
          <Text className="text-white text-base mb-2">eSIM Orders</Text>
          {/* Placeholder for orders - replace with real data later */}
          {[1, 2, 3].map((order, idx) => (
            <View key={order} className="mb-4 bg-[#1E263C] rounded-lg p-4">
              <Text className="text-white text-lg font-semibold mb-2">
                Order {order}
              </Text>
              <Text className="text-gray-400 mb-2">Package: Asia</Text>
              <Text className="text-gray-400 mb-2">Status: Active</Text>
              <AppButton
                label="Buy More Data"
                iconName="plus-circle"
                variant="moonlight"
                onPress={() => {
                  setShowTopup(true);
                }}
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
