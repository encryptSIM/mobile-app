import { AppButton } from "@/components/button";
import { useAsyncStorage } from "@/hooks/asyn-storage-hook";
import { createPaymentProfile } from "@/service/auth";
import { Link, router, useNavigation } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
  const navigation = useNavigation();
  const { setValue } = useAsyncStorage<string>("publicKey");

  const handleCreatePaymentProfile = async () => {
    try {
      const response = await createPaymentProfile();
      const publicKey = response.data?.publicKey;
      if (publicKey) {
        await setValue(publicKey);
        router.replace("/login/account");
      }
    } catch (error) {
      console.error("Error creating payment profile:", error);
    }
  };
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
      <View
        style={{
          gap: 50,
        }}
        className="flex flex-col"
      >
        <AppButton
          label="Setup payment profile"
          iconName="credit-card"
          variant="moonlight"
          onPress={() => {
            handleCreatePaymentProfile();
          }}
        />
        <AppButton
          label="Use existing payment profile"
          iconName="folder"
          variant="moonlight"
          onPress={async () => {
            try {
              await setValue("Fip7DsE6uA9tgQcatYkWQEYfyCmcoYPSrCoTPr2SbE76");
              router.replace("/login/account");
            } catch (error) {
              console.error("Error setting value:", error);
            }
          }}
        />
      </View>

      {/* Login Button */}
      {/* <TouchableOpacity
        onPress={async () => {
          await setValue("Fip7DsE6uA9tgQcatYkWQEYfyCmcoYPSrCoTPr2SbE76");
          router.replace("/login/account");
        }}
        className="mt-10 mb-6 border border-white rounded-full py-4 items-center"
      >
        <Text className="text-white font-semibold text-base">
          Login Test Account
        </Text>
      </TouchableOpacity> */}
      <View></View>
    </SafeAreaView>
  );
}
