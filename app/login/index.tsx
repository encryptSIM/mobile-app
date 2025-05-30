import { AppButton } from "@/components/button";
import { Text, View } from "@/components/Themed";
import { useAsyncStorage } from "@/hooks/asyn-storage-hook";
import { createPaymentProfile } from "@/service/auth";
import { router } from "expo-router";
import { Image, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@react-navigation/native";

export default function LoginScreen() {
  const { setValue } = useAsyncStorage<string>("publicKey");
  const { colors } = useTheme();

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colors.background,
        paddingHorizontal: 16,
      }}
    >
      {/* Top bar */}
      <View
        style={{
          marginTop: 12,
          paddingVertical: 8,
          paddingHorizontal: 8,
          backgroundColor: colors.background,
          borderRadius: 12,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Image
          source={require("../../assets/splash/logo.png")}
          style={{ width: 40, height: 40 }}
          resizeMode="contain"
        />
        <TouchableOpacity
          style={{
            backgroundColor: colors.primary,
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 999,
          }}
        >
          <Text
            style={{ color: "white", fontWeight: "600" }}
            onPress={() => {
              router.replace("/onboarding");
            }}
          >
            Connect Wallet
          </Text>
        </TouchableOpacity>
      </View>

      {/* Button group inside card */}
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View
          style={{
            borderRadius: 16,
            padding: 16,
            marginTop: 80,
            gap: 20,
            backgroundColor: colors.background,
          }}
        >
          <AppButton
            label="Setup payment profile"
            iconName="credit-card"
            variant="moonlight"
            onPress={() => {
              router.replace({
                pathname: "/login/account",
                params: { state: "create" },
              });
            }}
          />
          <AppButton
            label="Use existing payment profile"
            iconName="folder"
            variant="moonlight"
            onPress={() => {
              router.replace({
                pathname: "/login/account",
                params: { state: "login" },
              });
            }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
