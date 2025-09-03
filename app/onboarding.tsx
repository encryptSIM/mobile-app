import { useState } from "react";
import {
  useWindowDimensions,
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from "react-native";
import { card } from "@/components/app-providers";
import { getDimensions } from "@/utils/dimensions";
import { detectEnvironment, isSolanaWalletExtensionAvailable } from "@/utils/environment";
import { OpenInWalletPrompt } from "@/components/openInWalletPrompt";
import { sizing } from "@/constants/sizing";
import { useWalletAuth } from "@/components/auth/wallet-auth-provider";

const slides = [
  {
    key: "1",
    title: "Unbreakable Security",
    description: "Private, borderless mobile data.\nNo trackers, no logs.",
    image: require("@/assets/onboarding/shield.png"),
    buttonText: "Next",
  },
  {
    key: "2",
    title: "Speed Meets Freedom",
    description:
      "Global 5G in 138+ countries.\nFast, reliable, and private.",
    image: require("@/assets/onboarding/rocket.png"),
    buttonText: "Next",
  },
  {
    key: "3",
    title: "Your Web3 Gateway",
    description:
      "No KYC. Crypto-ready.\nFrom $1.95/day or $99/year.",
    image: require("@/assets/onboarding/solana.png"),
    buttonText: "Get Started",
  },
];

const { width: baseWidth, height: baseHeight } = getDimensions();
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;
const scale = (size: number) => (baseWidth / guidelineBaseWidth) * size;
const verticalScale = (size: number) => (baseHeight / guidelineBaseHeight) * size;

export default function Onboarding() {
  const { width } = useWindowDimensions();
  const isMobile = width <= 480; // ✅ switch point (largest phone size)

  const { isLoading, connect } = useWalletAuth();

  const [index, setIndex] = useState(0);

  const handleNext = async () => {
    if (index < slides.length - 1) {
      setIndex((prev) => prev + 1);
    } else {
      try {
        await connect();
      } catch (error) {
        console.error("❌ Sign-in failed:", error);
      }
    }
  };

  const env = detectEnvironment()

  if (env.isWeb && !env.isWalletBrowser && !isSolanaWalletExtensionAvailable()) {
    return <OpenInWalletPrompt />;
  }
  const handleGetStarted = async () => {
    try {
      await connect();
    } catch (error) {
      console.error("❌ Sign-in failed:", error);
    }
  };

  // ✅ MOBILE: Wizard style
  if (isMobile) {
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
          <TouchableOpacity
            style={[styles.button, isLoading && styles.loadingButton]}
            onPress={handleNext}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading && index === slides.length - 1
                ? "Connecting..."
                : slides[index].buttonText}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ✅ DESKTOP: Scrolling landing style
  return (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.container} contentContainerStyle={styles.scrollContent}>
      {slides.map((slide, i) => {
        const isEven = i % 2 === 0;
        return (
          <View
            key={slide.key}
            style={[
              styles.section,
              { flexDirection: isEven ? "row" : "row-reverse" },
            ]}
          >
            {/* IMAGE */}
            <View style={[styles.imageContainerDesktop]}>
              <Image source={slide.image} style={styles.imageDesktop} />
            </View>

            {/* TEXT */}
            <View style={styles.textContainerDesktop}>
              <Text style={styles.title}>{slide.title}</Text>
              <Text style={styles.description}>{slide.description}</Text>
              {i === slides.length - 1 && (
                <TouchableOpacity
                  style={[styles.button, isLoading && styles.loadingButton]}
                  onPress={handleGetStarted}
                  disabled={isLoading}
                >
                  <Text style={styles.buttonText}>
                    {isLoading ? "Connecting..." : "Get Started"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // Shared
  container: {
    flex: 1,
    backgroundColor: "#0A0F1C",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 12,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: "rgba(248, 250, 252, 0.7)",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 22,
  },
  button: {
    backgroundColor: "#7BE596",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginTop: 20,
    alignSelf: "center",
  },
  loadingButton: {
    opacity: 0.7,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },

  // Mobile wizard
  imageContainer: {
    width: "100%",
    flex: 1.1,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  image: {
    width: baseWidth * 0.55,
    height: baseWidth * 0.55,
    resizeMode: "contain",
    marginTop: verticalScale(Platform.OS === "android" ? 30 : 60),
  },
  content: {
    width: "100%",
    backgroundColor: card,
    borderTopLeftRadius: scale(28),
    borderTopRightRadius: scale(28),
    alignItems: "center",
    paddingHorizontal: sizing.horizontalPadding,
    paddingBottom: sizing.padding * 4,
    paddingTop: sizing.padding * 3,
    flex: 0.8,
    gap: sizing.padding * 2,
    minHeight: verticalScale(260),
    maxHeight: verticalScale(340),
  },
  pagination: {
    flexDirection: "row",
    marginBottom: sizing.padding,
  },
  dot: {
    width: scale(8),
    height: scale(8),
    borderRadius: scale(4),
    backgroundColor: "#444",
    marginHorizontal: scale(4),
  },
  activeDot: {
    width: scale(20),
    backgroundColor: "#7BE596",
  },

  // Desktop landing
  scrollContent: {
    paddingVertical: 60,
  },
  section: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  imageContainerDesktop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  imageDesktop: {
    width: 250,
    height: 250,
    resizeMode: "contain",
  },
  textContainerDesktop: {
    flex: 1,
    backgroundColor: card,
    borderRadius: 20,
    padding: 40,
    maxWidth: 500,
    alignItems: "flex-start",
    justifyContent: "center",
  },
});
