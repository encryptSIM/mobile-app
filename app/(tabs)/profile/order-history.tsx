import { ESimOrderCard } from "@/components/ESimOrderCard";
import { TopUpModal } from "@/components/TopUpModal";
import { SafeAreaView, ScrollView, Text, View } from "react-native";
import React from "react";
import { Header } from "@/components/Header";

export default function OrderHistoryScreen() {
  // Sample orders data - in a real app, this would come from an API or database
  const orders = [
    { id: 101, region: "Asia", status: "Active", dataUsed: 3, dataLimit: 5 },
    { id: 102, region: "Europe", status: "Active", dataUsed: 2, dataLimit: 5 },
    { id: 103, region: "USA", status: "Active", dataUsed: 1, dataLimit: 5 },
  ];

  // Top-up modal state
  const [showTopup, setShowTopup] = React.useState(false);
  const [selectedData, setSelectedData] = React.useState("1GB");
  const [selectedDay, setSelectedDay] = React.useState("3");

  return (
    <SafeAreaView className="flex-1 bg-[#0E1220]">
      <Header title="Order History" showBackButton />
      {/* Top-up Modal */}
      <TopUpModal
        visible={showTopup}
        onClose={() => setShowTopup(false)}
        selectedData={selectedData}
        setSelectedData={setSelectedData}
        selectedDay={selectedDay}
        setSelectedDay={setSelectedDay}
        onBuy={() => {
          // Handle buy logic here
          setShowTopup(false);
        }}
      />

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <Text className="text-white text-xl font-bold mb-4">
          📦 Your eSIM Orders
        </Text>

        {orders.map((order, idx) => (
          <ESimOrderCard
            key={order.id}
            order={order}
            index={idx}
            onBuyMoreData={() => setShowTopup(true)}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
