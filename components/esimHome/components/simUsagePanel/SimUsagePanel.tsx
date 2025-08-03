import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { $styles } from "./styles";

const exampleStats: UsageStat[] = [
  {
    total: 50,
    used: 24,
    label: "Call",
    icon: 'phone',
  },
  {
    total: 50,
    used: 35,
    label: "Data",
    icon: 'wifi',
  },
  {
    total: 50,
    used: 12,
    label: "SMS",
    icon: 'message',
  },
  {
    total: 10,
    used: 3,
    label: "Validity",
    icon: 'calendar-month',
    formatValue: () => '3 days'
  },
]

export interface UsageStat {
  total: number
  used: number
  label: string
  icon: string
  formatValue?: () => string
}

export interface SimUsagePanelProps {
  stats?: UsageStat[]
}

interface CircularProgressProps {
  percentage: number
  size: number
}

function CircularProgress({ percentage, size }: CircularProgressProps) {
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;

  // Create multiple small segments to simulate a circle
  const segments = 60;
  const segmentAngle = 360 / segments;
  const filledSegments = Math.round((percentage / 100) * segments);

  return (
    <View style={[$styles.circularProgress, { width: size, height: size }]}>
      {/* Background circle */}
      <View style={[
        $styles.progressCircle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: strokeWidth,
          borderColor: '#DADADA',
        }
      ]} />

      {/* Progress indicator using a simpler approach */}
      <View style={[
        $styles.progressIndicator,
        {
          width: size - strokeWidth * 2,
          height: size - strokeWidth * 2,
          borderRadius: (size - strokeWidth * 2) / 2,
          borderWidth: strokeWidth,
          borderColor: 'transparent',
          borderTopColor: '#4CAF50',
          transform: [{ rotate: `${(percentage / 100) * 360 - 90}deg` }]
        }
      ]} />
    </View>
  );
}

export function SimUsagePanel({ stats = exampleStats }: SimUsagePanelProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedStat = stats[selectedIndex];
  const percentage = (selectedStat.used / selectedStat.total) * 100;

  return (
    <View style={$styles.root}>
      <View style={$styles.headerIcons}>
        {stats.map((stat, index) => (
          <TouchableOpacity
            key={index}
            style={[
              $styles.iconContainer,
              selectedIndex === index && $styles.selectedIconContainer
            ]}
            onPress={() => setSelectedIndex(index)}
          >
            <MaterialIcons
              name={stat.icon as any}
              size={24}
              color={selectedIndex === index ? "#4CAF50" : "#666"}
            />
            <Text style={[
              $styles.iconLabel,
              selectedIndex === index && $styles.selectedIconLabel
            ]}>
              {stat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Circular Progress */}
      <View style={$styles.progressContainer}>
        <View style={$styles.circularProgressWrapper}>
          <CircularProgress
            percentage={percentage}
            size={200}
          />
          <View style={$styles.progressTextContainer}>
            <Text style={$styles.progressValue}>
              {selectedStat.formatValue ? selectedStat.formatValue() : selectedStat.used}
            </Text>
          </View>
        </View>
      </View>

      {/* Top up button */}
      <TouchableOpacity style={$styles.topUpButton}>
        <Text style={$styles.topUpButtonText}>Top up the plan</Text>
      </TouchableOpacity>
    </View>
  );
}
