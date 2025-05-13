import React from "react";
import { View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { TimerText } from "./TimerText";

interface ProgressCircleProps {
  radius: number;
  strokeWidth?: number;
  progress: number; // between 0 and 1
  backgroundColor?: string;
  progressColor?: string;
}

const ProgressCircle: React.FC<ProgressCircleProps> = ({
  radius,
  strokeWidth = 4,
  progress,
  backgroundColor = "#1E263C",
  progressColor = "#4ade80",
}) => {
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  const size = radius * 2 + strokeWidth;

  return (
    <Svg width={size} height={size}>
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={backgroundColor}
        strokeWidth={strokeWidth}
        fill="none"
      />
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={progressColor}
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </Svg>
  );
};

export const CircularTimer = ({ remainingTime }: { remainingTime: number }) => {
  const totalTime = 10 * 60 * 1000;
  const progress = remainingTime / totalTime;
  const radius = 30;
  const strokeWidth = 4;
  const size = radius * 2 + strokeWidth;
  return (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <View style={{ width: size, height: size, position: "relative" }}>
        <ProgressCircle
          radius={radius}
          strokeWidth={strokeWidth}
          progress={progress}
        />
        <TimerText remaining={remainingTime} />
      </View>
    </View>
  );
};
