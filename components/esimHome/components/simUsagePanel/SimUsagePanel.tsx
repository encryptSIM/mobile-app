import React, { useState } from "react";
import Svg, { Circle } from "react-native-svg";
import { View, Text, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { $styles } from "./styles";
import { useSharedState } from "@/hooks/use-provider";
import { $api, Sim } from "@/api/api";
import { SIMS } from "@/components/checkout/hooks/useCheckout";
import { SELECTED_SIM } from "../../hooks/useEsimHomeScreen";
import { ActivityIndicator } from "react-native-paper";
import { useWalletUi } from "@/components/solana/use-wallet-ui";
import { brandGreen } from "@/components/app-providers";
import { useThrottledCallback } from "@/hooks/use-throttled-callback";

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
  topup: () => void
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
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#DADADA"
          strokeWidth={strokeWidth}
          fill="none"
        />
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
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
    </View>
  );
}

export function SimUsagePanel({ stats = exampleStats, topup }: SimUsagePanelProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedStat = stats?.[selectedIndex] ?? exampleStats[0];
  const remaining = (selectedStat.total ?? 1) - (selectedStat.used ?? 1);
  const percentage = (remaining / (selectedStat.total ?? 1)) * 100;
  const [, setSims] = useSharedState<Sim[]>(SIMS.key)
  const [selectedSim, setSelectedSim] = useSharedState<Sim | null>(SELECTED_SIM.key)
  const { account } = useWalletUi();
  const throttledTopup = useThrottledCallback(topup, 1000)
  const setSimInstalledMut = $api.useMutation('post', '/mark-sim-installed', {
    onSuccess: () => {
      setSims(prev => prev.map(sim => {
        if (selectedSim && sim.iccid === selectedSim.iccid) {
          return ({
            ...sim,
            installed: false,
          })
        }
        return sim
      }))
      setSelectedSim(prev => ({
        ...prev!,
        installed: false
      }))

    },
    onError: (error) => {
      console.error(error)
    }
  })

  const progressColor =
    percentage > 50 ? brandGreen : percentage > 20 ? "#FFC107" : "#F44336";

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
            onPressIn={() => setSelectedIndex(index)}
            accessibilityLabel={`Select ${stat.label}`}
          >
            <MaterialIcons
              name={stat.icon as any}
              size={24}
              color={selectedIndex === index ? "white" : "#666"}
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

      <TouchableOpacity
        style={$styles.topUpButton}
        onPress={throttledTopup}
        accessibilityLabel="Top up your plan"
      >
        <Text style={$styles.topUpButtonText}>Top up the plan</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={$styles.textButton}
        disabled={setSimInstalledMut.isPending}
        onPressIn={
          () => setSimInstalledMut.mutate({
            body: {
              installed: false,
              iccid: selectedSim!.iccid,
              id: account?.address
            }
          })
        }
      >
        {
          !setSimInstalledMut.isPending
            ? <Text style={$styles.installedText}>I haven't installed this SIM yet</Text>
            : <ActivityIndicator />
        }
      </TouchableOpacity>
    </View>
  );
}
