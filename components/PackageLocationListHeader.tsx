import React, { memo } from "react";
import { View, StyleSheet } from "react-native";
import SlidingTabs from "@/components/Tab";

interface ListHeaderProps {
  tabs: string[];
  activeTab: number;
  onTabChange: (index: number) => void;
}

const PackageLocationListHeader = memo(({ tabs, activeTab, onTabChange }: ListHeaderProps) => {
  return (
    <View style={styles.tabsContainer}>
      <SlidingTabs tabs={tabs} activeTab={activeTab} onTabChange={onTabChange} />
    </View>
  );
});

const styles = StyleSheet.create({
  tabsContainer: {
    position: "relative",
    zIndex: 1000,
    width: "100%",
    backgroundColor: "transparent",
  },
});

export default PackageLocationListHeader;
