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
          stroke="#32D583"
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
