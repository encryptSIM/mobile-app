import { Text, View } from "@/components/Themed";
import { AppButton } from "@/components/button";
import { useAsyncStorage } from "@/hooks/asyn-storage-hook";
import { router } from "expo-router";
import { SafeAreaView } from "react-native";

export default function AccountScreen() {
  const { value: publicKey, loading } = useAsyncStorage<string>("publicKey");

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-white">Loading...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <SafeAreaView>
        <Text className="text-red-500 text-3xl font-bold text-center mb-8">
          Account
        </Text>
        <View className="w-full">
          <Text className="text-white text-lg font-semibold mb-4">
            Account Details
          </Text>
          <View
            style={{
              gap: 20,
            }}
            className="w-full flex flex-col bg-gray-800 p-4 rounded-lg"
          >
            <Text className="text-white">
              Account Address: {publicKey || "Not available"}
            </Text>
            <AppButton
              label="Next"
              iconName="arrow-right"
              variant="moonlight"
              showRightArrow={false}
              onPress={() => {
                router.replace("/(tabs)/esim/package");
              }}
            />
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
