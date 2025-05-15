import { Header } from "@/components/Header";
import { Text, View } from "@/components/Themed";
import { AppButton } from "@/components/button";
import { useAsyncStorage } from "@/hooks/asyn-storage-hook";
import {
  getPackages,
  type EsimPackage,
  type RegionPackage,
} from "@/service/package";
import { OrderProcessing } from "@/components/OrderProcessing";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, SafeAreaView } from "react-native";

export default function OrderProcessingScreen() {
  const [packageDetails, setPackageDetails] = useState<EsimPackage | null>(
    null
  );
  const [screenError, setScreenError] = useState<string | null>(null);
  const [isLoadingPackage, setIsLoadingPackage] = useState(false);

  const router = useRouter();
  const params = useLocalSearchParams<{ packageId: string; price: string }>();

  useEffect(() => {
    const fetchPackageDetails = async () => {
      if (!params.packageId) {
        setScreenError("Package ID is missing.");
        return;
      }
      if (!params.price) {
        setScreenError("Price is missing.");
        return;
      }

      try {
        setIsLoadingPackage(true);
        setScreenError(null);
        const response = await getPackages({ type: "global" });

        if (response.error) {
          setScreenError(response.error);
          return;
        }

        if (response.data) {
          const allPackages = response.data.flatMap((region: RegionPackage) =>
            region.operators.flatMap((op) => op.packages)
          );
          const pkg = allPackages.find(
            (p: EsimPackage) => p.id === params.packageId
          );
          if (pkg) {
            setPackageDetails(pkg);
          } else {
            setScreenError("Package not found.");
          }
        } else {
          setScreenError("No package data received.");
        }
      } catch (error) {
        setScreenError("Failed to fetch package details. Please try again.");
      } finally {
        setIsLoadingPackage(false);
      }
    };

    fetchPackageDetails();
  }, [params.packageId, params.price]);

  const handleOrderSuccess = () => {
    console.log("Order processing successful (new order flow).");
  };

  const handleOrderError = (errorMsg: string) => {
    setScreenError(`Order failed: ${errorMsg}`);
  };

  if (isLoadingPackage) {
    return (
      <SafeAreaView className="flex-1 bg-[#0E1220]">
        <Header showBackButton title="Process Order" />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#00FFAA" />
          <Text className="text-gray-400 mt-4">Loading package details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (screenError && !packageDetails) {
    return (
      <SafeAreaView className="flex-1 bg-[#0E1220]">
        <Header showBackButton title="Process Order" />
        <View className="flex-1 justify-center items-center px-4">
          <Text className="text-red-500 text-center text-lg mb-4">Error</Text>
          <Text className="text-gray-300 text-center mb-6">{screenError}</Text>
          <AppButton
            label="Go Back"
            onPress={() => router.back()}
            variant="moonlight"
          />
        </View>
      </SafeAreaView>
    );
  }

  if (!packageDetails || !params.packageId || !params.price) {
    return (
      <SafeAreaView className="flex-1 bg-[#0E1220]">
        <Header showBackButton title="Process Order" />
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-400">Package information is missing.</Text>
          <AppButton
            label="Go Back"
            onPress={() => router.back()}
            variant="moonlight"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <OrderProcessing
      packageId={params.packageId}
      price={params.price}
      packageDetails={{
        data: packageDetails.data,
        day: packageDetails.day,
      }}
      onSuccess={handleOrderSuccess}
      onError={handleOrderError}
      isTopUp={false}
    />
  );
}
