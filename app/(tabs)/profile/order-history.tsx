import { AppButton } from "@/components/button";
import { ESimOrderCard } from "@/components/ESimOrderCard";
import { Header } from "@/components/Header";
import { OrderProcessing } from "@/components/OrderProcessing";
import { TopUpModal } from "@/components/TopUpModal";
import { useAsyncStorage } from "@/hooks/asyn-storage-hook";
import {
  getOrderHistory,
  type GetOrderHistoryResponse,
} from "@/service/payment";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from "react-native";

export default function OrderHistoryScreen() {
  const { value: address } = useAsyncStorage<string>("publicKey");
  const [orders, setOrders] = useState<GetOrderHistoryResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Top-up modal state
  const [showTopup, setShowTopup] = useState(false);
  const [selectedData, setSelectedData] = useState("1GB");
  const [selectedDay, setSelectedDay] = useState("3");
  const [selectedIccid, setSelectedIccid] = useState("");
  const [selectedPackage, setSelectedPackage] = useState<{
    id: string;
    price: string;
    data: string;
    day: number;
  } | null>(null);

  const fetchOrderHistory = useCallback(async () => {
    if (!address) return;

    try {
      setIsLoading(true);
      setError(null);
      const response = await getOrderHistory(address);

      if (response.error) {
        setError(response.error);
        return;
      }

      if (response.data) {
        setOrders(response.data);
      }
    } catch (error) {
      setError("Failed to fetch order history");
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  useEffect(() => {
    fetchOrderHistory();
  }, [fetchOrderHistory]);

  const handleTopUpSuccess = useCallback(() => {
    setSelectedPackage(null);
    fetchOrderHistory();
  }, [fetchOrderHistory]);

  const handleTopUpError = useCallback((error: string) => {
    setError(error);
    setSelectedPackage(null);
  }, []);

  const renderContent = () => {
    if (error) {
      return (
        <View className="items-center space-y-4 py-8">
          <Text className="text-red-500 text-center">{error}</Text>
          <AppButton
            label="Retry"
            iconName="refresh-cw"
            variant="moonlight"
            onPress={fetchOrderHistory}
          />
        </View>
      );
    }

    if (isLoading) {
      return (
        <View className="items-center justify-center py-8">
          <ActivityIndicator size="large" color="#00FFAA" />
          <Text className="text-gray-400 mt-4">Loading order history...</Text>
        </View>
      );
    }

    if (orders.length === 0) {
      return (
        <View className="items-center justify-center py-8">
          <Text className="text-gray-400 text-center">
            No orders found. Your order history will appear here.
          </Text>
        </View>
      );
    }

    return (
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <Text className="text-white text-xl font-bold mb-4">
          📦 Your eSIM Orders
        </Text>

        {orders.map((order, idx) => (
          <ESimOrderCard
            key={order.orderId + idx}
            order={order}
            index={idx}
            onBuyMoreData={() => {
              setSelectedIccid(order.iccid);
              setShowTopup(true);
            }}
          />
        ))}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0E1220]">
      {/* <Header title="Order History" showBackButton /> */}

      {/* Top-up Modal */}
      {address && (
        <TopUpModal
          ppPublicKey={address}
          iccid={selectedIccid}
          visible={showTopup}
          onClose={() => setShowTopup(false)}
          selectedData={selectedData}
          setSelectedData={setSelectedData}
          selectedDay={selectedDay}
          setSelectedDay={setSelectedDay}
          onSelectPackage={(packageDetails) => {
            setSelectedPackage(packageDetails);
            setShowTopup(false);
          }}
        />
      )}

      {/* Order Processing Screen */}
      {selectedPackage && (
        <OrderProcessing
          packageId={selectedPackage.id}
          price={selectedPackage.price}
          packageDetails={{
            data: selectedPackage.data,
            day: selectedPackage.day,
          }}
          iccidForTopUp={selectedIccid}
          isTopUp={true}
          onSuccess={handleTopUpSuccess}
          onError={handleTopUpError}
        />
      )}

      {/* Main Content */}
      {!selectedPackage && renderContent()}
    </SafeAreaView>
  );
}
