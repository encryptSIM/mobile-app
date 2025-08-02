import { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useAuth } from "@/components/auth/auth-provider";
import { getDimensions } from "@/utils/dimensions";

// Responsive scaling helpers
const { width, height } = getDimensions();
const guidelineBaseWidth = 375; // iPhone 11/12/13/14 width
const guidelineBaseHeight = 812;

const scale = (size: number) => (width / guidelineBaseWidth) * size;
const verticalScale = (size: number) => (height / guidelineBaseHeight) * size;

const slides = [
  {
    key: "1",
    title: "Unbreakable Security",
    description: "eSIM + dVPN.\nNo trackers, no logs.",
    image: require("@/assets/onboarding/shield.png"),
    buttonText: "Next",
  },
  {
    key: "2",
    title: "Speed Meets Freedom",
    description:
      "Global 5G in 138+ countries, fast servers.\nSentinel dVPN boosts speed with privacy.",
    image: require("@/assets/onboarding/rocket.png"),
    buttonText: "Next",
  },
  {
    key: "3",
    title: "Your Web3 Gateway",
    description:
      "No KYC, crypto-ready, from $1.95 or $99/yr.\nInstant eSIM + dVPN for secure global use.",
    image: require("@/assets/onboarding/solana.png"),
    buttonText: "Get Started",
  },
];

export default function Onboarding() {
  const [index, setIndex] = useState(0);
  const { signIn } = useAuth()


  const handleNext = async () => {
    if (index < slides.length - 1) {
      setIndex((prev) => prev + 1);
    } else {
      await signIn()

    }
  };

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
    flex: 1,
    backgroundColor: "#0A0F1C",
    alignItems: "center",
    justifyContent: "space-between",
  },
  imageContainer: {
    width: "100%",
    flex: 1.1, // More space on taller screens
    alignItems: "center",
    justifyContent: "flex-end",
  },
  image: {
    width: width * 0.55,
    height: width * 0.55,
    resizeMode: "contain",
    marginTop: verticalScale(Platform.OS === "android" ? 30 : 60),
  },
  content: {
    width: "100%",
    backgroundColor: "#202939",
    borderTopLeftRadius: scale(28),
    borderTopRightRadius: scale(28),
    alignItems: "center",
    paddingHorizontal: scale(30),
    paddingBottom: verticalScale(40),
    paddingTop: verticalScale(24),
    flex: 0.8,
    gap: verticalScale(20),
    minHeight: verticalScale(260),
    maxHeight: verticalScale(340),
  },
  title: {
    fontSize: scale(22),
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: verticalScale(6),
  },
  description: {
    fontSize: scale(14.5),
    color: "rgba(248, 250, 252, 0.7)",
    textAlign: "center",
    marginBottom: verticalScale(14),
    lineHeight: scale(21),
  },
  pagination: {
    flexDirection: "row",
    marginBottom: verticalScale(8),
  },
  dot: {
    width: scale(8),
    height: scale(8),
    borderRadius: scale(4),
    backgroundColor: "#444",
    marginHorizontal: scale(4),
    transitionDuration: "200ms",
  },
  activeDot: {
    width: scale(20),
    backgroundColor: "#7BE596",
  },
  button: {
    backgroundColor: "#7BE596",
    alignItems: "center",
    width: "100%",
    borderRadius: scale(12),
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(48),
    marginTop: verticalScale(4),
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: scale(16),
  },
});
