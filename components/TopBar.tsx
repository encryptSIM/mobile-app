import React from "react";
import { View, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Header } from "./Header";

interface TopBarProps {
  onAvatarPress?: () => void;
  showBackButton?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  onAvatarPress,
  showBackButton = false,
}) => {
  const rightComponent = (
    <TouchableOpacity onPress={onAvatarPress}>
      <Image
        source={{ uri: "https://i.pravatar.cc/100" }}
        style={styles.avatar}
      />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header showBackButton={showBackButton} rightComponent={rightComponent} />
      <Image
        source={require("../assets/onboarding/shield.png")}
        style={styles.shield}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    marginTop: 8,
  },
  shield: { width: 36, height: 36, resizeMode: "contain" },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#fff",
  },
});
