import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { brandGreen, card } from './app-providers';

interface SlidingTabsProps {
  tabs: string[];
  activeTab: number;
  onTabChange?: (index: number) => void;
  style?: any;
}

const SlidingTabs: React.FC<SlidingTabsProps> = ({
  tabs = ['Countries', 'Regional plan'],
  activeTab,
  onTabChange,
  style,
}) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const screenWidth = Dimensions.get('window').width;
  const tabWidth = (screenWidth - 64) / 2;

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
      <View style={styles.tabWrapper}>
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
            style={[styles.tabButton, { width: tabWidth }]}
            onPress={() => handleTabChange(index)}
            activeOpacity={0.7}
          >
            <Text
              disabled={true}
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
    alignItems: 'center',
    borderRadius: 100,
  },
  tabWrapper: {
    width: '100%',
    position: 'relative',
    flexDirection: 'row',
    backgroundColor: card,
    borderRadius: 24,
    padding: 4,
    minWidth: 320,
  },
  tabIndicator: {
    position: 'absolute',
    top: 4,
    left: 4,
    height: 44,
    backgroundColor: '#373E4C',
    borderRadius: 20,
    zIndex: 0,
  },
  tabButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
  },
  activeText: {
    color: brandGreen,
  },
  inactiveText: {
    color: '#9ca3af',
  },
});

export default SlidingTabs;
