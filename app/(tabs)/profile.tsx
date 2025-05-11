import { AppButton } from "@/components/button";
import { useAsyncStorage } from "@/hooks/asyn-storage-hook";
import { addressFormatter } from "@/utils";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { SafeAreaView, ScrollView, Text, View } from "react-native";
import { Header } from "@/components/Header";

export default function ProfileScreen() {
  const { value: address, setValue } = useAsyncStorage<string>("publicKey");

  return (
    <SafeAreaView className="flex-1 bg-[#0E1220]">
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
      </ScrollView>
    </SafeAreaView>
  );
}
