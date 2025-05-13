import React from "react";
import { Text, View, StyleSheet } from "react-native";

export const TimerText = ({ remaining }: { remaining: number }) => {
  const minutes = Math.floor(remaining / 60000);
  const seconds = Math.floor((remaining / 1000) % 60)
    .toString()
    .padStart(2, "0");

  return (
    <View style={[StyleSheet.absoluteFillObject, styles.center]}>
      <Text style={styles.text}>{`${minutes}:${seconds}`}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  center: {
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: "black",
    fontSize: 18,
    fontWeight: "bold",
  },
});
