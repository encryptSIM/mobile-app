import { useEffect, useState } from "react";
import { View, Image, Text, StyleSheet, Platform } from "react-native";

const SplashScreen = ({ onFinish }: { onFinish: () => void }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onFinish();
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/splash/logo.png")}
        style={styles.logo}
      />
      <Text style={styles.title}>encryptSIM</Text>
      <Text style={styles.subtitle}>Web3 + eSIM + dVPN{"\n"}Total Privacy</Text>
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0F1C",
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: "contain",
  },
  title: {
    marginTop: 20,
    fontSize: 40,
    color: "white",
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 15,
    color: "white",
    textAlign: "center",
    marginTop: 12,
  },
});
