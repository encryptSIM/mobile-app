import React from "react";
import {
  Modal,
  View,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
} from "react-native";

interface ResponsiveModalProps {
  visible: boolean;
  onRequestClose: () => void;
  children: React.ReactNode;
}

export function ResponsiveModal({
  visible,
  onRequestClose,
  children,
}: ResponsiveModalProps) {
  const isLargeScreen = Dimensions.get("window").width > 600

  return (
    <Modal
      animationType={isLargeScreen ? "fade" : "slide"}
      transparent={true}
      visible={visible}
      onRequestClose={onRequestClose}
    >
      <TouchableWithoutFeedback onPress={onRequestClose}>
        <View
          style={[
            styles.overlay,
            isLargeScreen ? styles.centerOverlay : styles.bottomOverlay,
          ]}
        >
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.modalContent,
                isLargeScreen
                  ? styles.centeredContent
                  : styles.bottomSheetContent,
              ]}
            >
              {children}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  centerOverlay: {
    justifyContent: "center",
    alignItems: "center",
  },
  bottomOverlay: {
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#1a1f2e",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    maxHeight: "90%",
    width: "90%",
  },
  centeredContent: {
    alignSelf: "center",
    padding: 20,
  },
  bottomSheetContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    width: "100%",
    paddingBottom: 16,
  },
});
