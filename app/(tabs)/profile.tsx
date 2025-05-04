import React from "react";
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { AppButton } from "@/components/button";

export default function ProfileScreen() {
  return (
    <SafeAreaView className="flex-1 bg-[#0E1220]">
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Back Button */}
        <View className="px-4 pt-4">
          <TouchableOpacity>
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>

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

          {/* Username */}
          <View className="flex-row items-center mt-4">
            <MaterialCommunityIcons name="crown" size={18} color="#A678F0" />
            <Text className="text-white text-lg font-semibold ml-1">hal</Text>
          </View>

          {/* Email */}
          <View className="border border-green-400 rounded-full px-4 py-1 mt-2">
            <Text className="text-green-400 text-sm">hal@proton.me</Text>
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
            <AppButton
              label="Change Password"
              iconName="lock"
              variant="moonlight"
              onPress={() => {}}
            />

            {/* Logout */}
            <AppButton
              label="Logout"
              iconName="log-out"
              variant="inactive"
              onPress={() => {}}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
