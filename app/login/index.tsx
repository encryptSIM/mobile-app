import { View, Text, TextInput, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
  return (
    <SafeAreaView className="flex-1 bg-[#0A0F25] px-6 justify-between">
      {/* Top section */}
      <View className="mt-4">
        {/* Shield logo + Connect Wallet */}
        <View className="flex-row justify-between items-center">
          <Image
            source={require("../../assets/splash/logo.png")} // Replace with your logo
            className="w-10 h-10"
            resizeMode="contain"
          />
          <TouchableOpacity className="bg-[#52DD7E] px-4 py-2 rounded-full">
            <Text className="text-white font-semibold">Connect Wallet</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Middle section */}
      <View className="mt-20">
        {/* Login / Sign up Toggle */}
        <View className="bg-[#1B223C] flex-row rounded-full p-1 mb-6">
          <TouchableOpacity className="flex-1 items-center py-3 bg-[#52DD7E] rounded-full">
            <Text className="text-white font-semibold">Login</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 items-center py-3">
            <Text className="text-[#52DD7E] font-semibold opacity-50">
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>

        {/* Email */}
        <Text className="text-white mb-2">E-Mail Address</Text>
        <View className="flex-row items-center bg-[#1B223C] rounded-full px-4 py-3 mb-4">
          {/* <MaterialCommunityIcons
            name="email-outline"
            size={20}
            color="white"
          /> */}
          <TextInput
            className="text-white ml-3 flex-1"
            placeholder="Enter your e-mail"
            placeholderTextColor="#A1A1AA"
          />
        </View>

        {/* Password */}
        <Text className="text-white mb-2">Password</Text>
        <View className="flex-row items-center bg-[#1B223C] rounded-full px-4 py-3">
          {/* <Ionicons name="lock-closed-outline" size={20} color="white" /> */}
          <TextInput
            className="text-white ml-3 flex-1"
            placeholder="Enter your password"
            placeholderTextColor="#A1A1AA"
            secureTextEntry
          />
        </View>

        {/* Forgot password */}
        <TouchableOpacity className="mt-2 self-end">
          <Text className="text-white text-sm opacity-50">
            Forgot Password?
          </Text>
        </TouchableOpacity>
      </View>

      {/* Login Button */}
      <TouchableOpacity className="mt-10 mb-6 border border-white rounded-full py-4 items-center">
        <Text className="text-white font-semibold text-base">Login</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
