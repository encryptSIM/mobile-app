import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

interface PowerButtonProps {
  onPress: () => void;
  disabled?: boolean;
  connected?: boolean;
}

export const PowerButton: React.FC<PowerButtonProps> = ({
  onPress,
  disabled = false,
  connected = false,
}) => {
  return (
    <View style={styles.centerContent}>
      <TouchableOpacity
        style={[
          styles.powerButton,
          disabled && styles.powerButtonDisabled,
          connected && styles.powerButtonConnected,
        ]}
        onPress={onPress}
        disabled={disabled}
      >
        <Text style={[styles.powerIcon, disabled && styles.powerIconDisabled]}>
          <Ionicons name="power" size={32} color="white" />
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  centerContent: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 48,
    marginBottom: 32,
  },
  powerButton: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "#B71C1C",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 8,
  },
  powerButtonDisabled: {
    backgroundColor: "#666",
    shadowOpacity: 0.1,
  },
  powerIcon: {
    fontSize: 64,
    color: "#fff",
  },
  powerIconDisabled: {
    color: "#ccc",
  },
  powerButtonConnected: {
    backgroundColor: "#008000",
  },
});
