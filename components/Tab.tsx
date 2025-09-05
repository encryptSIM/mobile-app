import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { brandGreen, card } from "./app-providers";
import { sizing } from "@/constants/sizing";

interface SlidingTabsProps {
  tabs: string[];
  activeTab: number;
  onTabChange?: (index: number) => void;
  style?: any;
}

const SlidingTabs: React.FC<SlidingTabsProps> = ({
  tabs = ["Countries", "Regional"],
  activeTab,
  onTabChange,
  style,
}) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const screenWidth = Dimensions.get("window").width;
  const containerPadding = 32;
  const availableWidth = Math.min(screenWidth - containerPadding, 320);
  const tabWidth = availableWidth / tabs.length;

  useEffect(() => {
    Animated.spring(translateX, {
      toValue: activeTab * tabWidth,
      useNativeDriver: true,
      tension: 300,
      friction: 30,
    }).start();
  }, [activeTab, tabWidth, translateX]);

  const handleTabChange = (index: number) => {
    onTabChange?.(index);
  };

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.tabWrapper, { width: availableWidth }]}>
        <Animated.View
          style={[
            styles.tabIndicator,
            {
              width: tabWidth,
              transform: [{ translateX }],
            },
          ]}
        />

        {tabs.map((tab, index) => (
          <TouchableOpacity
            key={index}
            style={styles.tabButton}
            onPress={() => handleTabChange(index)}
            activeOpacity={0.7}
          >
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={[
                styles.tabText,
                activeTab === index ? styles.activeText : styles.inactiveText,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    borderRadius: 100,
  },
  tabWrapper: {
    position: "relative",
    flexDirection: "row",
    backgroundColor: card,
    borderRadius: 24,
    padding: 4,
    alignSelf: "center",
    overflow: "hidden",
  },
  tabIndicator: {
    position: "absolute",
    top: 4,
    left: 4,
    bottom: 4,
    backgroundColor: "#373E4C",
    borderRadius: 20,
    zIndex: 0,
  },
  tabButton: {
    flex: 1,
    paddingVertical: sizing.padding,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  tabText: {
    fontSize: sizing.fontLarge,
    fontWeight: "500",
    textAlign: "center",
  },
  activeText: {
    color: brandGreen,
  },
  inactiveText: {
    color: "#9ca3af",
  },
});

export default SlidingTabs;
