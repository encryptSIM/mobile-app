import { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

const slides = [
  {
    key: "1",
    title: "Unbreakable Security",
    description: "eSIM + dVPN.\nNo trackers, no logs.",
    image: require("../../assets/splash/logo.png"),
    buttonText: "Next",
  },
  {
    key: "2",
    title: "Speed Meets Freedom",
    description:
      "Global 5G in 138+ countries, fast servers.\nSentinel dVPN boosts speed with privacy.",
    image: require("../../assets/splash/logo.png"),
    buttonText: "Next",
  },
  {
    key: "3",
    title: "Your Web3 Gateway",
    description:
      "No KYC, crypto-ready, from $1.95 or $99/yr.\nInstant eSIM + dVPN for secure global use.",
    image: require("../../assets/splash/logo.png"),
    buttonText: "Get Started",
  },
];

export default function Onboarding() {
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // useEffect(() => {
  //   const checkFirstTime = async () => {
  //     const isFirstTime = await AsyncStorage.getItem("isFirstTime");
  //     if (isFirstTime === "false") {
  //       router.replace("/login"); // Redirect if already seen
  //     } else {
  //       setLoading(false); // Show onboarding
  //     }
  //   };
  //   checkFirstTime();
  // }, []);

  const handleNext = async () => {
    if (index < slides.length - 1) {
      setIndex((prev) => prev + 1);
    } else {
      await AsyncStorage.setItem("isFirstTime", "false");
      router.replace("/login"); // Go to app
    }
  };

  if (!loading) {
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" color="#7BE596" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image source={slides[index].image} style={styles.image} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{slides[index].title}</Text>
        <Text style={styles.description}>{slides[index].description}</Text>
        <View style={styles.pagination}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, index === i && styles.activeDot]}
            />
          ))}
        </View>
        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>{slides[index].buttonText}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: "100%",
    display: "flex",
    backgroundColor: "#0A0F1C",
    alignItems: "center",
    justifyContent: "space-between",
  },
  imageContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: 500,
  },
  image: {
    width: width * 0.6,
    height: width * 0.6,
    resizeMode: "contain",
    marginTop: 80,
  },
  content: {
    paddingBottom: 40,
    borderRadius: 24,
    display: "flex",
    backgroundColor: "#202939",
    width: "100%",
    height: 350,
    paddingHorizontal: 40,
    alignItems: "center",
    gap: 25,
    justifyContent: "flex-end",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: "rgba(248, 250, 252, 0.6)",
    textAlign: "center",
    marginBottom: 24,
  },
  pagination: {
    flexDirection: "row",
    marginBottom: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#444",
    marginHorizontal: 4,
  },
  activeDot: {
    width: 20,
    backgroundColor: "#7BE596",
  },
  button: {
    backgroundColor: "#7BE596",
    display: "flex",
    alignItems: "center",
    width: "100%",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 48,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
