import { getOrder, type GetOrderResponse } from "@/service/payment";
import { Link, useRouter } from "expo-router";
import { useSearchParams } from "expo-router/build/hooks";
import React, { useCallback, useEffect, useState } from "react";
import { Text, View, ActivityIndicator, TouchableOpacity } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { SafeAreaView } from "react-native-safe-area-context";
import { Header } from "@/components/Header";

const POLLING_INTERVAL = 5000;
const POLLING_TIMEOUT = 10 * 60 * 1000; // 10 minutes

const OrderStatus = React.memo(
  ({ orderId, status }: { orderId: string | null; status: string }) => (
    <View className="items-center space-y-2">
      <Text className="text-white text-lg font-semibold">
        Order ID: {orderId}
      </Text>
      <Text className="text-white">{status}</Text>
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

    const handleInstallPress = () => {
      if (installationUrl) {
        router.push(installationUrl as any);
      }
    };

    return (
      <>
        <View className="mt-6 bg-[#1E263C] p-4 rounded-xl w-full flex items-center">
          <Text className="text-green-400 text-center text-lg font-medium">
            SIM Ready!
          </Text>
          <QRCode size={200} value={qrcode} />
        </View>
        {installationUrl && (
          <TouchableOpacity onPress={handleInstallPress}>
            <Text className="text-white mt-2 text-sm">
              Click here to install the eSIM
            </Text>
          </TouchableOpacity>
        )}
        <Text className="text-white mt-2 text-sm">
          Scan the QR code to activate your eSIM.
        </Text>
      </>
    );
  }
);

export default function OrderScreen() {
  const orderId = useSearchParams().get("orderId");
  const [status, setStatus] = useState("Waiting for payment...");
  const [orderStatus, setOrderStatus] = useState<GetOrderResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pollOrderStatus = useCallback(
    async (isCancelled: boolean) => {
      if (!orderId) {
        setStatus("No order ID provided");
        return;
      }

      const startTime = Date.now();

      while (Date.now() - startTime < POLLING_TIMEOUT && !isCancelled) {
        try {
          const response = await getOrder(orderId);

          if (response.status === 204) {
            setStatus("Waiting for order confirmation...");
          } else if (response.status === 200) {
            const data = response.data;
            setOrderStatus(data);
            setStatus("Order found");

            if (data.paymentReceived && data.sim) {
              setStatus("Payment confirmed. SIM is ready!");
              break;
            }
          } else {
            setError(`Unexpected status: ${response.status}`);
            break;
          }
        } catch (error) {
          console.error("Polling error", error);
          setError("Error fetching order");
          break;
        }

        await new Promise((r) => setTimeout(r, POLLING_INTERVAL));
      }

      if (!isCancelled && (!orderStatus || !orderStatus.paymentReceived)) {
        setError("Payment timeout - no response received within 10 minutes");
      }
    },
    [orderId]
  );

  useEffect(() => {
    let isCancelled = false;
    pollOrderStatus(isCancelled);
    return () => {
      isCancelled = true;
    };
  }, [pollOrderStatus]);

  return (
    <SafeAreaView className="flex-1 bg-[#0A0F25]">
      <Header showBackButton={true} title="Order Status" />
      <View className="px-6 justify-center flex-1">
        <View className="items-center space-y-4">
          <OrderStatus orderId={orderId} status={status} />

          {error ? (
            <Text className="text-red-500">{error}</Text>
          ) : !orderStatus?.paymentReceived ? (
            <ActivityIndicator size="large" color="#00FFAA" />
          ) : orderStatus.sim ? (
            <SimReady
              qrcode={orderStatus.sim.qrcode}
              installationUrl={orderStatus.sim.direct_apple_installation_url}
            />
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  );
}
