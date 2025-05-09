import { getOrder, type GetOrderResponse } from "@/service/payment";
import { Link } from "expo-router";
import { useSearchParams } from "expo-router/build/hooks";
import { useEffect, useState } from "react";
import { Text, View, ActivityIndicator, Alert } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { SafeAreaView } from "react-native-safe-area-context";

const POLLING_INTERVAL = 5000;
const POLLING_TIMEOUT = 10 * 60 * 1000; // 10 minutes

export default function OrderScreen() {
  const orderId = useSearchParams().get("orderId");
  const [status, setStatus] = useState("Waiting for payment...");
  const [orderStatus, setOrderStatus] = useState<GetOrderResponse | null>(null);

  useEffect(() => {
    if (!orderId) {
      setStatus("No order ID provided");
      return;
    }

    let isCancelled = false;

    const pollStatus = async () => {
      const startTime = Date.now();

      while (Date.now() - startTime < POLLING_TIMEOUT && !isCancelled) {
        try {
          const response = await getOrder(orderId as string);

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
            setStatus(`Unexpected status: ${response.status}`);
            break;
          }
        } catch (error) {
          console.error("Polling error", error);
          setStatus("Error fetching order");
          break;
        }

        await new Promise((r) => setTimeout(r, POLLING_INTERVAL));
      }

      //   if (!isCancelled && (!orderStatus || !orderStatus.paymentReceived)) {
      //     Alert.alert("Timeout", "Payment was not received within 10 minutes.");
      //   }
    };

    pollStatus();
    return () => {
      isCancelled = true;
    };
  }, [orderId]);

  return (
    <SafeAreaView className="flex-1 bg-[#0A0F25] px-6 justify-center">
      <View className="items-center space-y-4">
        <Text className="text-white text-lg font-semibold">
          Order ID: {orderId}
        </Text>
        <Text className="text-white">{status}</Text>

        {!orderStatus?.paymentReceived && (
          <ActivityIndicator size="large" color="#00FFAA" />
        )}

        {orderStatus?.paymentReceived && (
          <>
            <View className="mt-6 bg-[#1E263C] p-4 rounded-xl w-full flex items-center">
              <Text className="text-green-400 text-center text-lg font-medium">
                SIM Ready!
              </Text>
              {/* <Text className="text-white">
                {JSON.stringify(orderStatus.sim, null, 2)}
              </Text> */}
              <QRCode size={200} value={orderStatus.sim.qrcode} />
            </View>
            <Link
              href={orderStatus.sim?.direct_apple_installation_url}
              className="mt-4"
              asChild
            >
              <Text className="text-white mt-2 text-sm">
                Click here to install the eSIM
              </Text>
            </Link>
            <View className=""></View>
            <Text className="text-white mt-2 text-sm">
              Scan the QR code to activate your eSIM.
            </Text>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}
