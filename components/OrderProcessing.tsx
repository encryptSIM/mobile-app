import { CircularTimer } from "@/components/CircularTimer";
import { Header } from "@/components/Header";
import { Text, View } from "@/components/Themed";
import { AppButton } from "@/components/button";
import { useAsyncStorage } from "@/hooks/asyn-storage-hook";
import { useBalance } from "@/hooks/balance";
import { useOrderPolling } from "@/hooks/use-order-polling";
import { useTopUpPolling } from "@/hooks/use-topup-polling";
import { errorLog } from "@/service/error-log";
import {
  createOrder,
  createTopUp,
  type GetOrderResponse,
  type TopUpResult,
} from "@/service/payment";
import { Feather } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";

interface OrderProcessingProps {
  packageId: string;
  price: string;
  iccidForTopUp?: string;
  packageDetails?: {
    data: string;
    day: number;
  };
  onSuccess?: () => void;
  onError?: (error: string) => void;
  isTopUp?: boolean;
}

const EPSILON = 0.00001;

export const OrderProcessing: React.FC<OrderProcessingProps> = ({
  packageId,
  price,
  iccidForTopUp,
  packageDetails,
  onSuccess,
  onError,
  isTopUp = false,
}) => {
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
  const [priceInSol, setPriceInSol] = useState<number | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [pollingTopUpTransactionId, setPollingTopUpTransactionId] = useState<
    string | null
  >(null);
  const [topUpPaymentAmountForModal, setTopUpPaymentAmountForModal] = useState<
    number | null
  >(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successDetails, setSuccessDetails] = useState<{
    orderId: string;
    paymentInSol: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    if (price && solPrice) {
      const usdPrice = parseFloat(price);
      setPriceInSol(usdPrice / solPrice);
    }
  }, [price, solPrice]);

  useEffect(() => {
    const endTime = Date.now() + cooldownDuration;
    setCooldownEndTime(endTime);
    setRemainingTime(cooldownDuration);
    setStoredCooldown(endTime.toString());
  }, []);

  useEffect(() => {
    if (!cooldownEndTime) return;
    const timer = setInterval(() => {
      const remaining = cooldownEndTime - Date.now();
      if (remaining <= 0) {
        clearInterval(timer);
        setCooldownEndTime(null);
        setRemainingTime(0);
        setStoredCooldown("");
      } else {
        setRemainingTime(remaining);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownEndTime]);

  const { isPolling: isPollingOrder } = useOrderPolling(
    orderId,
    !!orderId && !isTopUp,
    (res: GetOrderResponse) => {
      router.push({
        pathname: "/esim/order",
        params: { orderId: res.orderId },
      });
      onSuccess?.();
    },
    (msg: string) => setError(msg)
  );

  const { isPolling: isPollingTopUp } = useTopUpPolling(
    pollingTopUpTransactionId,
    !!pollingTopUpTransactionId,
    topUpPaymentAmountForModal,
    (res: TopUpResult, amount: number) => {
      console.log("res & show success modal", res);
      setSuccessDetails({ orderId: res.orderId, paymentInSol: amount });
      setShowSuccessModal(true);
    },
    (msg: string) => setError(msg)
  );

  const handleCreateOrder = useCallback(async () => {
    if (!publicKey || !packageId || !price) return;
    try {
      setIsProcessing(true);
      setError(null);

      if (isTopUp) {
        if (!iccidForTopUp) throw new Error("ICCID is required for top-up.");

        const res = await createTopUp({
          package_id: packageId,
          ppPublicKey: publicKey,
          iccid: iccidForTopUp,
          package_price: price,
        });

        if (res.error) throw new Error(res.error);
        if (res.data) {
          setPollingTopUpTransactionId(res.data.orderId);
          setTopUpPaymentAmountForModal(res.data.paymentInSol);
        } else {
          throw new Error("Top-up response is missing data.");
        }
      } else {
        const res = await createOrder({
          package_id: packageId,
          ppPublicKey: publicKey,
          quantity: 1,
          package_price: price,
        });

        if (res.error) throw new Error(res.error);
        if (res.data) {
          console.log("res.data", res.data);
          setOrderId(res.data.orderId);
        } else {
          throw new Error("Create order response is missing data.");
        }

        const cooldownEnd = Date.now() + cooldownDuration;
        setCooldownEndTime(cooldownEnd);
        setRemainingTime(cooldownDuration);
        setStoredCooldown(cooldownEnd.toString());
      }
    } catch (err: any) {
      await errorLog(err as Error);
      const msg = err?.message || "Order creation failed.";
      setError(msg);
      onError?.(msg);
    } finally {
      setIsProcessing(false);
    }
  }, [publicKey, packageId, price, isTopUp, iccidForTopUp]);

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
            {cooldownEndTime && remainingTime > 0 && (
              <View className="items-center mb-6">
                <CircularTimer remainingTime={remainingTime} />
              </View>
            )}

            <View className="bg-[#1E263C] rounded-xl p-4 mb-6">
              <Text
                style={{ fontSize: 20, fontWeight: "500", marginBottom: 8 }}
              >
                Wallet Information
              </Text>
              <View className="flex-row items-center justify-between mb-1">
                <Text style={{ fontSize: 18, marginBottom: 4 }}>
                  Address: {formatAddress(publicKey || "")}
                </Text>
                {publicKey && (
                  <TouchableOpacity onPress={copyAddress}>
                    <Feather name="copy" size={20} color="#4ade80" />
                  </TouchableOpacity>
                )}
              </View>
              <View className="flex-row items-center justify-between">
                <Text style={{ fontSize: 18 }}>
                  Balance:{" "}
                  {balanceLoading
                    ? "Loading..."
                    : balanceError
                    ? "Error"
                    : `${balance?.toFixed(4)} SOL`}
                </Text>
                <TouchableOpacity onPress={refreshBalance}>
                  <Feather name="refresh-cw" size={20} color="#4ade80" />
                </TouchableOpacity>
              </View>
            </View>

            <View className="bg-[#1E263C] rounded-xl p-4 mb-6">
              <Text
                style={{ fontSize: 20, fontWeight: "500", marginBottom: 8 }}
              >
                Order Information
              </Text>
              {packageDetails ? (
                <>
                  <View className="flex-row justify-between mb-1">
                    <Text
                      style={{
                        fontSize: 18,
                        marginBottom: 4,
                      }}
                    >
                      Data
                    </Text>
                    <Text style={{ fontSize: 18 }}>{packageDetails.data}</Text>
                  </View>
                  <View className="flex-row justify-between mb-1">
                    <Text
                      style={{
                        fontSize: 18,

                        marginBottom: 4,
                      }}
                    >
                      Duration
                    </Text>
                    <Text style={{ fontSize: 18 }}>
                      {packageDetails.day} Days
                    </Text>
                  </View>
                  <View className="flex-row justify-between mb-1">
                    <Text
                      style={{
                        fontSize: 18,

                        marginBottom: 4,
                      }}
                    >
                      Price (USD)
                    </Text>
                    <Text style={{ fontSize: 18, color: "#4ade80" }}>
                      ${price}
                    </Text>
                  </View>
                  <View className="flex-row justify-between mb-1">
                    <Text
                      style={{
                        fontSize: 18,

                        marginBottom: 4,
                      }}
                    >
                      Price (SOL)
                    </Text>
                    <Text style={{ fontSize: 18, color: "#4ade80" }}>
                      {priceInSol
                        ? `${priceInSol.toFixed(4)} SOL`
                        : "Loading..."}
                    </Text>
                  </View>
                </>
              ) : (
                <Text style={{ fontSize: 18 }}>Loading package details...</Text>
              )}
            </View>

            <AppButton
              label={isProcessing ? "Processing..." : "Create Order"}
              iconName="credit-card"
              variant="moonlight"
              // isDisabled={
              //   isProcessing ||
              //   balance === null ||
              //   priceInSol === null ||
              //   balance < priceInSol + EPSILON ||
              //   remainingTime > 0
              // }
              onPress={handleCreateOrder}
            />
          </View>

          {(isProcessing || isPollingOrder || isPollingTopUp) && (
            <View className="mt-6 items-center">
              <ActivityIndicator size="large" color="#00FFAA" />
              <Text className="text-sm text-gray-400 mt-2">
                {isProcessing
                  ? "Please wait while we process your order..."
                  : isPollingOrder
                  ? "Waiting for payment confirmation..."
                  : "Confirming top-up activation..."}
              </Text>
            </View>
          )}

          {error && (
            <View className="mt-6 items-center">
              <Text className="text-red-500">{error}</Text>
              <View className="mt-4">
                <AppButton
                  label="Retry"
                  iconName="refresh-cw"
                  variant="moonlight"
                  onPress={handleCreateOrder}
                />
              </View>
            </View>
          )}
        </View>
      </SafeAreaView>

      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-[#1E263C] rounded-xl p-6 w-[90%] max-w-[400px]">
            <View className="items-center mb-6">
              <View className="w-16 h-16 rounded-full bg-green-500/20 items-center justify-center mb-4">
                <Feather name="check" size={32} color="#4ade80" />
              </View>
              <Text className="text-xl font-bold text-white mb-2">
                Success!
              </Text>
              <Text className="text-gray-300 text-center">
                Your top-up order has been processed successfully.
              </Text>
            </View>

            <View className="bg-[#0E1220] rounded-lg p-4 mb-6">
              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-300">Order ID:</Text>
                <Text className="text-white">{successDetails?.orderId}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-300">Amount Paid:</Text>
                <Text className="text-green-400">
                  {successDetails?.paymentInSol.toFixed(4)} SOL
                </Text>
              </View>
            </View>

            <AppButton
              label="Done"
              variant="moonlight"
              onPress={() => {
                setShowSuccessModal(false);
                onSuccess?.();
              }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};
