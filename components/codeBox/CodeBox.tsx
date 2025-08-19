import { useRef } from "react";
import { Platform, Text, View, Pressable } from "react-native";
import { $styles } from "./styles";

export const CodeBox = ({ code }: { code: string }) => {
  const textRef = useRef(null);

  const handleSelectAll = () => {
    if (Platform.OS === "web" && textRef.current) {
      // Use browser range selection
      const range = document.createRange();
      range.selectNodeContents(textRef.current);
      const selection = window.getSelection()!
      selection.removeAllRanges();
      selection.addRange(range);
    }
  };

  return (
    <View style={$styles.codeContainer}>
      <Text style={$styles.codeLabel}>Activation Code:</Text>

      <Pressable onPress={handleSelectAll}>
        <View style={$styles.codeBox}>
          <Text
            ref={textRef}
            style={$styles.codeText}
            selectable
            selectionColor="rgba(50,213,131,0.3)"
          >
            {code}
          </Text>
        </View>
      </Pressable>

      <Text style={$styles.codeHelper}>
        {Platform.OS === "web"
          ? "Tap the code to highlight, then copy"
          : "Tap and hold to select all, then copy"}
      </Text>
    </View>
  );
};
