import { Header } from "@/components/Header";
import { Text, View } from "@/components/Themed";
import { CircularTimer } from "@/components/CircularTimer";
import { AppButton } from "@/components/button";
import { useAsyncStorage } from "@/hooks/asyn-storage-hook";
import { useBalance } from "@/hooks/balance";
import {
  createOrder,
  getOrder,
  type GetOrderResponse,
  createTopUp,
  type ServiceResponse,
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

const POLLING_INTERVAL = 5000;
const POLLING_TIMEOUT = 10 * 60 * 1000;

interface OrderProcessingProps {
  packageId: string;
  price: string;
  packageDetails?: {
    data: string;
    day: number;
  };
  onSuccess?: () => void;
  onError?: (error: string) => void;
  isTopUp?: boolean;
}

export const OrderProcessing: React.FC<OrderProcessingProps> = ({
  packageId,
  price,
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
  const [orderStatus, setOrderStatus] = useState<GetOrderResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successDetails, setSuccessDetails] = useState<{
    orderId: string;
    paymentInSol: number;
  } | null>(null);

  const router = useRouter();

  // Calculate price in SOL when USD price or SOL price changes
  useEffect(() => {
    if (price && solPrice) {
      const usdPrice = parseFloat(price);
      const solAmount = usdPrice / solPrice;
      setPriceInSol(solAmount);
    }
  }, [price, solPrice]);

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

  // Polling logic for order status
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

          if (response.error) {
            setError(response.error);
            onError?.(response.error);
            break;
          }

          if (!response.data) {
            setOrderStatus(null);
          } else {
            setOrderStatus(response.data);
            if (response.data.sim) {
              router.push({
                pathname: "/esim/order",
                params: { orderId },
              });
              onSuccess?.();
              break;
            }
          }
        } catch (error) {
          const errorMsg = "Error fetching order status";
          setError(errorMsg);
          onError?.(errorMsg);
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
  }, [orderId, orderStatus, router, onSuccess, onError]);

  // Create order logic
  const handleCreateOrder = useCallback(async () => {
    if (!publicKey || !packageId || !price) return;

    try {
      setIsProcessing(true);
      setError(null);

      if (isTopUp) {
        const response = await createTopUp({
          package_id: packageId,
          ppPublicKey: publicKey,
          iccid: packageId, // Using packageId as iccid for top-up
          package_price: price,
        });

        if (response.error) {
          setError(response.error);
          onError?.(response.error);
          return;
        }

        if (response.data) {
          setSuccessDetails({
            orderId: response.data.orderId,
            paymentInSol: response.data.paymentInSol,
          });
          setShowSuccessModal(true);
          onSuccess?.();
        }
      } else {
        const response = await createOrder({
          package_id: packageId,
          ppPublicKey: publicKey,
          quantity: 1,
          package_price: price,
        });

        if (response.error) {
          setError(response.error);
          onError?.(response.error);
          return;
        }

        if (response.data) {
          setOrderId(response.data.orderId);

          // Optional: restart cooldown after successful order
          const cooldownEnd = Date.now() + cooldownDuration;
          setCooldownEndTime(cooldownEnd);
          setRemainingTime(cooldownDuration);
          setStoredCooldown(cooldownEnd.toString());
        }
      }
    } catch (error) {
      const errorMsg = "Failed to create order. Please try again.";
      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  }, [
    publicKey,
    packageId,
    price,
    setStoredCooldown,
    onError,
    onSuccess,
    isTopUp,
  ]);

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
                    <Text className="text-sm text-green-400">${price}</Text>
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
                isDisabled={
                  isProcessing ||
                  isPolling ||
                  !packageDetails ||
                  (balance !== null &&
                    solPrice !== null &&
                    balance < priceInSol!)
                }
                onPress={handleCreateOrder}
              />
            </View>
          </View>

          {/* Processing Spinner */}
          {(isProcessing || isPolling) && (
            <View className="mt-6 items-center">
              <ActivityIndicator size="large" color="#00FFAA" />
              <Text className="text-sm text-gray-400 mt-2">
                {isProcessing
                  ? "Please wait while we process your order..."
                  : "Waiting for payment confirmation..."}
              </Text>
            </View>
          )}

          {/* Error Message */}
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

      {/* Success Modal */}
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
                <Text className="text-gray-300">Order ID</Text>
                <Text className="text-white">{successDetails?.orderId}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-300">Amount Paid</Text>
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
