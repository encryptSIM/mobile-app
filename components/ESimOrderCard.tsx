import { AppButton } from "@/components/button";
import { View, Text, StyleSheet } from "react-native";
import React from "react";
import type { GetOrderHistoryResponse } from "@/service/payment";

interface ESimOrder {
  id: number;
  region: string;
  status: string;
  dataUsed: number;
  dataLimit: number;
}

interface ESimOrderCardProps {
  order: GetOrderHistoryResponse;
  index: number;
  onBuyMoreData: () => void;
}

export const ESimOrderCard: React.FC<ESimOrderCardProps> = ({
  order,
  index,
  onBuyMoreData,
}) => {
  const percent = Math.round((3 / 5) * 100);
  const progressWidth = Math.max(5, percent);
  let barColor = styles.greenBar;
  if (percent >= 90) barColor = styles.redBar;
  else if (percent >= 60) barColor = styles.yellowBar;

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.orderTitle}>{order.orderId}</Text>
        {/* <Text style={styles.orderId}>#ID: {order.orderId}</Text> */}
      </View>

      {/* Chips */}
      <View style={styles.chipsRow}>
        <View style={styles.regionChip}>
          <Text style={styles.chipText}>🌏 {order.package_id} Package</Text>
        </View>
        {/* <View style={styles.statusChip}>
          <Text style={styles.chipText}>🟢 {order.status}</Text>
        </View> */}
      </View>

      {/* Data Usage */}
      <Text style={styles.usageLabel}>Data Usage</Text>
      <View>
        <View style={styles.usageRow}>
          <Text style={styles.usageText}>
            {/* {order.dataUsed} / {order.dataLimit} GB */}
          </Text>
          <Text style={styles.usageText}>{percent}% used</Text>
        </View>
        <View style={styles.progressContainer}>
          <View
            style={[
              styles.progressBar,
              barColor,
              { width: `${progressWidth}%` },
            ]}
          />
        </View>
      </View>

      {/* Button */}
      <AppButton
        label="Buy More Data"
        iconName="plus-circle"
        variant="moonlight"
        onPress={onBuyMoreData}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    backgroundColor: "#1E263C",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#2A3550",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  orderTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  orderId: {
    fontSize: 12,
    color: "#A0A0A0",
  },
  chipsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  regionChip: {
    backgroundColor: "#2E3B55",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusChip: {
    backgroundColor: "#16A34A",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
  },
  chipText: {
    fontSize: 14,
    color: "#FFFFFF",
  },
  usageLabel: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "600",
    marginBottom: 4,
  },
  usageRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  usageText: {
    fontSize: 12,
    color: "#FFFFFF",
  },
  progressContainer: {
    height: 16,
    backgroundColor: "#374151",
    borderRadius: 999,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#60A5FA",
    marginBottom: 16,
  },
  progressBar: {
    height: 16,
    borderRadius: 999,
  },
  greenBar: {
    backgroundColor: "#22C55E",
  },
  yellowBar: {
    backgroundColor: "#FACC15",
  },
  redBar: {
    backgroundColor: "#EF4444",
  },
});
