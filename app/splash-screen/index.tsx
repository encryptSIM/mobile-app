import { useEffect, useState } from "react";
import { View, Image, Text, StyleSheet } from "react-native";
import { ScaledSheet, moderateScale } from "react-native-size-matters"; // <--

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

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0F1C",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: "24@s", // responsive horizontal padding
  },
  logo: {
    width: "120@s", // scale with device size
    height: "120@s",
    resizeMode: "contain",
  },
  title: {
    marginTop: "20@vs",
    fontSize: "26@s", // scalable font size
    color: "white",
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: "15@s",
    color: "white",
    textAlign: "center",
    marginTop: "12@vs",
  },
});
