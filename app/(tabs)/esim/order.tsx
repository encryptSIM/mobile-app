import {
  getOrderResult,
  type GetOrderResponse,
  type ServiceResponse,
} from "@/service/payment";
import { useRouter } from "expo-router";
import { useSearchParams } from "expo-router/build/hooks";
import React, { useCallback, useEffect, useState } from "react";
import { Text, View, ActivityIndicator, Platform } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { SafeAreaView } from "react-native-safe-area-context";
import { Header } from "@/components/Header";
import { AppButton } from "@/components/button";
import { errorLog } from "@/service/error-log";

const OrderStatus = React.memo(
  ({ orderId, status }: { orderId: string | null; status: string }) => (
    <View className="flex items-center justify-center w-full px-4 py-6 rounded-xl bg-neutral-900 shadow-md">
      <View className="space-y-3 items-center">
        <Text className="text-white text-base font-medium tracking-wide">
          Order ID:
        </Text>
        <Text className="text-green-400 text-xl font-bold tracking-wider">
          {orderId ?? "N/A"}
        </Text>
        <Text
          className={`text-sm px-3 py-1 rounded-full ${
            status === "Success"
              ? "bg-green-500/20 text-green-300"
              : status === "Pending"
              ? "bg-yellow-500/20 text-yellow-300"
              : "bg-red-500/20 text-red-300"
          }`}
        >
          {status}
        </Text>
      </View>
    </View>
  )
);

const SimReady = React.memo(
  ({
    qrcode,
    installationUrl,
  }: {
    qrcode: string;
    installationUrl?: string;
  }) => {
    const router = useRouter();
    const isIOS = Platform.OS === "ios";

    const handleInstallPress = () => {
      if (installationUrl) {
        router.push(installationUrl as any);
      }
    };

    return (
      <View className="flex items-center justify-center" style={{ gap: 20 }}>
        <View className="mt-6 bg-[#1E263C] p-4 rounded-xl w-full flex items-center">
          <Text className="text-green-400 text-center text-lg font-medium">
            SIM Ready!
          </Text>
          <QRCode size={200} value={qrcode} />
        </View>
        {isIOS && installationUrl && (
          <AppButton
            label="Click here to install the eSIM"
            variant="moonlight"
            showRightArrow={false}
            onPress={handleInstallPress}
          />
        )}
        <Text className="text-white mt-2 text-sm">
          Scan the QR code to activate your eSIM.
        </Text>
      </View>
    );
  }
);

export default function OrderScreen() {
  const orderId = useSearchParams().get("orderId");
  const from = useSearchParams().get("from");
  const [orderStatus, setOrderStatus] = useState<GetOrderResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const fetchOrderStatus = useCallback(async () => {
    if (!orderId) {
      setError("No order ID provided");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await getOrderResult(orderId);

      if (response.error) {
        setError(response.error);
        return;
      }

      if (response.data) {
        setOrderStatus(response.data);
      } else {
        setError("Order not found");
      }
    } catch (error) {
      await errorLog(error as Error);
      setError("Error fetching order status");
    } finally {
      setIsLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (orderId) {
      fetchOrderStatus();
    }
  }, [orderId, fetchOrderStatus]);

  const renderContent = () => {
    if (error) {
      return (
        <View className="items-center space-y-4">
          <Text className="text-red-500">{error}</Text>
          <AppButton
            label="Retry"
            iconName="refresh-cw"
            variant="moonlight"
            onPress={fetchOrderStatus}
          />
        </View>
      );
    }

    if (isLoading) {
      return (
        <View className="items-center space-y-4">
          <ActivityIndicator size="large" color="#00FFAA" />
          <Text className="text-gray-400">Loading order status...</Text>
        </View>
      );
    }

    if (!orderStatus) {
      return <Text className="text-white">No order data available.</Text>;
    }

    if (orderStatus.sim) {
      return (
        <SimReady
          qrcode={orderStatus.sim.qrcode}
          installationUrl={orderStatus.sim.direct_apple_installation_url}
        />
      );
    }

    return (
      <View className="items-center space-y-4">
        <Text className="text-white">
          Order data loaded, but SIM not ready.
        </Text>
        <AppButton
          label="Refresh Status"
          iconName="refresh-cw"
          variant="moonlight"
          onPress={fetchOrderStatus}
        />
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0A0F25]">
      <Header
        onBackPress={() => {
          if (from) {
            router.push(from as any);
          } else {
            router.back();
          }
        }}
        showBackButton={true}
        title="Order Status"
      />
      <View className="px-6 justify-center flex-1">
        <View className="items-center space-y-4">
          <OrderStatus
            orderId={orderId}
            status={orderStatus?.sim ? "Success" : "Pending"}
          />
          {renderContent()}
        </View>
      </View>
    </SafeAreaView>
  );
}
