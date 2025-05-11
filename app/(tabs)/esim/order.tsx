import { getOrder, type GetOrderResponse } from "@/service/payment";
import { Link, useRouter } from "expo-router";
import { useSearchParams } from "expo-router/build/hooks";
import React, { useCallback, useEffect, useState } from "react";
import { Text, View, ActivityIndicator, TouchableOpacity } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { SafeAreaView } from "react-native-safe-area-context";
import { Header } from "@/components/Header";
import { AppButton } from "@/components/button";

const POLLING_INTERVAL = 5000;
const POLLING_TIMEOUT = 10 * 60 * 1000; // 10 minutes

const OrderStatus = React.memo(
  ({ orderId, status }: { orderId: string | null; status: string }) => (
    <View className="items-center justify-center px-4 py-6 rounded-xl bg-neutral-900 space-y-3 shadow-md">
      <Text className="text-white text-base font-medium tracking-wide">
        Order ID:
      </Text>
      <Text className="text-nowrap text-green-400 text-xl font-bold tracking-wider">
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
      <View className="flex items-center justify-center" style={{ gap: 20 }}>
        <View className="mt-6 bg-[#1E263C] p-4 rounded-xl w-full flex items-center">
          <Text className="text-green-400 text-center text-lg font-medium">
            SIM Ready!
          </Text>
          <QRCode size={200} value={qrcode} />
        </View>
        {installationUrl && (
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
  const [status, setStatus] = useState("Waiting for payment...");
  const [orderStatus, setOrderStatus] = useState<GetOrderResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  const fetchOrderStatus = useCallback(async () => {
    if (!orderId) {
      setStatus("No order ID provided");
      setError("No order ID provided");
      return;
    }
    setIsPolling(true);
    setError(null);
    try {
      const response = await getOrder(orderId);
      if (response.status === 204) {
        setStatus("Waiting for order confirmation...");
        setOrderStatus(null);
      } else if (response.status === 200) {
        const data = response.data;
        setOrderStatus(data);
        setStatus("Order found");
        if (data.sim) {
          setStatus("Payment confirmed. SIM is ready!");
        }
      } else {
        setError(`Unexpected status: ${response.status}`);
      }
    } catch (error) {
      setError("Error fetching order");
    }
    setIsPolling(false);
  }, [orderId]);

  // Polling logic
  useEffect(() => {
    let isCancelled = false;
    const pollOrderStatus = async () => {
      if (!orderId) return;
      setIsPolling(true);
      const startTime = Date.now();
      while (
        Date.now() - startTime < POLLING_TIMEOUT &&
        !isCancelled &&
        !(orderStatus && orderStatus.sim)
      ) {
        try {
          const response = await getOrder(orderId);
          if (response.status === 204) {
            setStatus("Waiting for order confirmation...");
            setOrderStatus(null);
          } else if (response.status === 200) {
            const data = response.data;
            setOrderStatus(data);
            setStatus("Order found");
            if (data.sim) {
              setStatus("Payment confirmed. SIM is ready!");
              break;
            }
          } else {
            setError(`Unexpected status: ${response.status}`);
            break;
          }
        } catch (error) {
          setError("Error fetching order");
          break;
        }
        await new Promise((r) => setTimeout(r, POLLING_INTERVAL));
      }
      setIsPolling(false);
    };
    pollOrderStatus();
    return () => {
      isCancelled = true;
    };
  }, [orderId, orderStatus]);

  return (
    <SafeAreaView className="flex-1 bg-[#0A0F25]">
      <Header showBackButton={true} title="Order Status" />
      <View className="px-6 justify-center flex-1">
        <View className="items-center space-y-4">
          <OrderStatus orderId={orderId} status={status} />

          {error ? (
            <>
              <Text className="text-red-500">{error}</Text>
              <View style={{ marginTop: 16 }}>
                <AppButton
                  label="Retry"
                  iconName="refresh-cw"
                  variant="moonlight"
                  onPress={fetchOrderStatus}
                />
              </View>
            </>
          ) : !orderStatus ? (
            <ActivityIndicator size="large" color="#00FFAA" />
          ) : orderStatus.sim ? (
            <SimReady
              qrcode={orderStatus.sim.qrcode}
              installationUrl={orderStatus.sim.direct_apple_installation_url}
            />
          ) : (
            <Text className="text-white">
              Order data loaded, but SIM not ready.
            </Text>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
