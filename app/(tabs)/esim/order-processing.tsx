import { Header } from "@/components/Header";
import { Text, View } from "@/components/Themed";
import { CircularTimer } from "@/components/CircularTimer";
import { AppButton } from "@/components/button";
import { useAsyncStorage } from "@/hooks/asyn-storage-hook";
import { useBalance } from "@/hooks/balance";
import {
  getPackages,
  type EsimPackage,
  type RegionPackage,
} from "@/service/package";
import { createOrder } from "@/service/payment";
import { Feather } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";

export default function OrderProcessingScreen() {
  const cooldownDuration = 10 * 60 * 1000; // 10 minutes

  const { value: publicKey } = useAsyncStorage<string>("publicKey");
  const { setValue: setStoredCooldown } =
    useAsyncStorage<string>("orderCooldown");

  const {
    balance,
    loading: balanceLoading,
    error: balanceError,
    refreshBalance,
    solPrice,
  } = useBalance(publicKey || "");

  const [cooldownEndTime, setCooldownEndTime] = useState<number | null>(null);
  const [remainingTime, setRemainingTime] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [packageDetails, setPackageDetails] = useState<EsimPackage | null>(
    null
  );
  const [priceInSol, setPriceInSol] = useState<number | null>(null);

  const router = useRouter();
  const params = useLocalSearchParams<{ packageId: string; price: string }>();

  // Calculate price in SOL when USD price or SOL price changes
  useEffect(() => {
    if (params.price && solPrice) {
      const usdPrice = parseFloat(params.price);
      const solAmount = usdPrice / solPrice;
      setPriceInSol(solAmount);
    }
  }, [params.price, solPrice]);

  // Auto-start countdown on mount
  useEffect(() => {
    const endTime = Date.now() + cooldownDuration;
    setCooldownEndTime(endTime);
    setRemainingTime(cooldownDuration);
    setStoredCooldown(endTime.toString());
  }, []);

  // Countdown tick logic
  useEffect(() => {
    if (!cooldownEndTime) return;

    const timer = setInterval(() => {
      const remaining = cooldownEndTime - Date.now();
      if (remaining <= 0) {
        setCooldownEndTime(null);
        setRemainingTime(0);
        setStoredCooldown("");
        clearInterval(timer);
      } else {
        setRemainingTime(remaining);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldownEndTime, setStoredCooldown]);

  // Fetch package info
  useEffect(() => {
    const fetchPackageDetails = async () => {
      if (!params.packageId) return;

      try {
        const res = await getPackages({ type: "global" });
        const allPackages = res.data.flatMap((region: RegionPackage) =>
          region.operators.flatMap((op) => op.packages)
        );
        const pkg = allPackages.find(
          (p: EsimPackage) => p.id === params.packageId
        );
        if (pkg) setPackageDetails(pkg);
      } catch (error) {
        console.error("Failed to fetch package details:", error);
      }
    };

    fetchPackageDetails();
  }, [params.packageId]);

  // Create order logic
  const handleCreateOrder = useCallback(async () => {
    if (!publicKey || !params.packageId || !params.price) return;

    try {
      setIsProcessing(true);
      const order = await createOrder({
        package_id: params.packageId,
        ppPublicKey: publicKey,
        quantity: 1,
        package_price: params.price,
      });

      // Optional: restart cooldown after successful order
      const cooldownEnd = Date.now() + cooldownDuration;
      setCooldownEndTime(cooldownEnd);
      setRemainingTime(cooldownDuration);
      setStoredCooldown(cooldownEnd.toString());

      router.push({
        pathname: "/esim/order",
        params: { orderId: order.data.orderId },
      });
    } catch (error) {
      console.error("Failed to create order:", error);
    } finally {
      setIsProcessing(false);
    }
  }, [publicKey, params, setStoredCooldown, router]);

  const formatAddress = (address: string) =>
    address ? `${address.slice(0, 4)}...${address.slice(-4)}` : "";

  const copyAddress = async () => {
    if (publicKey) await Clipboard.setStringAsync(publicKey);
  };

  return (
    <View className="flex-1 bg-[#0E1220]">
      <SafeAreaView className="flex-1">
        <Header showBackButton title="Process Order" />
        <View className="flex-1 px-4 py-6 justify-between">
          <View>
            {/* Timer */}
            {cooldownEndTime && remainingTime > 0 && (
              <View className="items-center mb-6">
                <CircularTimer remainingTime={remainingTime} />
              </View>
            )}

            <Text className="text-xl font-semibold mb-6">Order Processing</Text>

            {/* Wallet Info */}
            <View className="bg-[#1E263C] rounded-xl p-4 mb-6">
              <Text className="text-base font-medium mb-2 text-white">
                Wallet Information
              </Text>
              <View className="flex-row items-center justify-between mb-1">
                <Text className="text-sm text-gray-300">
                  Address: {formatAddress(publicKey || "")}
                </Text>
                {publicKey && (
                  <TouchableOpacity onPress={copyAddress}>
                    <Feather name="copy" size={16} color="#4ade80" />
                  </TouchableOpacity>
                )}
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-gray-300">
                  Balance:{" "}
                  {balanceLoading
                    ? "Loading..."
                    : balanceError
                    ? "Error"
                    : `${balance?.toFixed(4)} SOL`}
                </Text>
                <TouchableOpacity onPress={refreshBalance}>
                  <Feather name="refresh-cw" size={16} color="#4ade80" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Order Info */}
            <View className="bg-[#1E263C] rounded-xl p-4 mb-6">
              <Text className="text-base font-medium mb-2 text-white">
                Order Information
              </Text>
              {packageDetails ? (
                <>
                  <View className="flex-row justify-between mb-1">
                    <Text className="text-sm text-gray-300">Data</Text>
                    <Text className="text-sm text-white">
                      {packageDetails.data}
                    </Text>
                  </View>
                  <View className="flex-row justify-between mb-1">
                    <Text className="text-sm text-gray-300">Duration</Text>
                    <Text className="text-sm text-white">
                      {packageDetails.day} Days
                    </Text>
                  </View>
                  <View className="flex-row justify-between mb-1">
                    <Text className="text-sm text-gray-300">Price (USD)</Text>
                    <Text className="text-sm text-green-400">
                      ${params.price}
                    </Text>
                  </View>
                  <View className="flex-row justify-between mb-1">
                    <Text className="text-sm text-gray-300">Price (SOL)</Text>
                    <Text className="text-sm text-green-400">
                      {priceInSol
                        ? `${priceInSol.toFixed(4)} SOL`
                        : "Loading..."}
                    </Text>
                  </View>
                </>
              ) : (
                <Text className="text-sm text-gray-300">
                  Loading package details...
                </Text>
              )}
            </View>

            <View className="gap-4">
              <AppButton
                label={isProcessing ? "Processing..." : "Create Order"}
                iconName="credit-card"
                variant="moonlight"
                onPress={handleCreateOrder}
              />
            </View>
          </View>

          {/* Processing Spinner */}
          {isProcessing && (
            <View className="mt-6 items-center">
              <ActivityIndicator size="large" color="#00FFAA" />
              <Text className="text-sm text-gray-400 mt-2">
                Please wait while we process your order...
              </Text>
            </View>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}
