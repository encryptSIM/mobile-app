import React, { ReactNode } from "react";
import { StyleSheet, Dimensions, View } from "react-native";
import Svg, { Path, Defs, LinearGradient, Stop } from "react-native-svg";
import { path } from "./path";
import { $styles } from "./styles";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export function BackgroundWrapper({ children }: { children: ReactNode }) {
  return (
    <View style={$styles.root}>
      <View style={$styles.background}>
        <Svg
          style={StyleSheet.absoluteFillObject}
          width={screenWidth}
          height={screenHeight}
          viewBox="-200 60 891 404"
          preserveAspectRatio="xMidYMid slice"
          fill="none"
        >
          <Path
            d={path}
            fill="url(#paint0_linear_3734_9805)"
            fillOpacity={0.13}
          />
          <Defs>
            <LinearGradient
              id="paint0_linear_3734_9805"
              x1="445.171"
              y1="0"
              x2="445.171"
              y2="404"
              gradientUnits="userSpaceOnUse"
            >
              <Stop stopColor="#32D583" stopOpacity="0" />
              <Stop offset="0" stopColor="#32D583" stopOpacity="0.7" />
              <Stop offset="1" stopColor="#32D583" stopOpacity="0" />
            </LinearGradient>
          </Defs>
        </Svg>
      </View>
      {children}
    </View>
  );
};
