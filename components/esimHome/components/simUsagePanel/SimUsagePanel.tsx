import React, { useState } from "react";
import Svg, { Circle } from "react-native-svg";
import { View, Text, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { $styles } from "./styles";

const exampleStats: UsageStat[] = [
  {
    total: 50,
    used: 24,
    label: "Call",
    icon: "phone",
    unit: "mins",
  },
  {
    total: 50,
    used: 10,
    label: "Data",
    icon: "wifi",
    unit: "MB",
  },
  {
    total: 50,
    used: 12,
    label: "SMS",
    icon: "message",
    unit: "messages",
  },
  {
    total: 10,
    used: 3,
    label: "Validity",
    icon: "calendar-month",
    unit: "days",
    formatValue: () => "7 days left",
  },
];

export interface UsageStat {
  total: number;
  used: number;
  label: string;
  icon: string;
  unit: string;
  formatValue?: () => string;
}

export interface SimUsagePanelProps {
  stats?: UsageStat[];
}

interface CircularProgressProps {
  percentage: number;
  size: number;
  color: string;
}

function CircularProgress({ percentage, size, color }: CircularProgressProps) {
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        {/* Background Circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#DADADA"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress Circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`} // Rotate the circle to start at the top
        />
      </Svg>
    </View>
  );
}

export function SimUsagePanel({ stats = exampleStats }: SimUsagePanelProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedStat = stats[selectedIndex];
  const remaining = selectedStat.total - selectedStat.used;
  const percentage = (remaining / selectedStat.total) * 100;

  // Determine color based on remaining percentage
  const progressColor =
    percentage > 50 ? "#32D583" : percentage > 20 ? "#FFC107" : "#F44336";

  return (
    <View style={$styles.root}>
      <View style={$styles.headerIcons}>
        {stats.map((stat, index) => (
          <TouchableOpacity
            key={index}
            style={[
              $styles.iconContainer,
              selectedIndex === index && $styles.selectedIconContainer,
            ]}
            onPress={() => setSelectedIndex(index)}
            accessibilityLabel={`Select ${stat.label}`}
          >
            <MaterialIcons
              name={stat.icon as any}
              size={24}
              color={selectedIndex === index ? "#4CAF50" : "#666"}
            />
            <Text
              style={[
                $styles.iconLabel,
                selectedIndex === index && $styles.selectedIconLabel,
              ]}
            >
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
            size={230}
            color={progressColor}
          />
          <View style={$styles.progressTextContainer}>
            <Text style={$styles.progressValue}>
              {selectedStat.formatValue
                ? selectedStat.formatValue()
                : `${remaining} ${selectedStat.unit}`}
            </Text>
            <Text style={$styles.progressSubtitle}>
              {`Remaining out of ${selectedStat.total}`}
            </Text>
          </View>
        </View>
      </View>

      {/* Top up button */}
      <TouchableOpacity
        style={$styles.topUpButton}
        accessibilityLabel="Top up your plan"
      >
        <Text style={$styles.topUpButtonText}>Top up the plan</Text>
      </TouchableOpacity>
    </View>
  );
}
