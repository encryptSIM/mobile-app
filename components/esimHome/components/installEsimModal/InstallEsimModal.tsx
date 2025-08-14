import { Modal, View, ScrollView, TouchableOpacity, Image } from "react-native";
import { IconButton, Text } from "react-native-paper";
import QRCode from "react-native-qrcode-skia";
import { $styles } from "./styles";
import { useRef } from "react";
import { brandGreen } from "@/components/app-providers";
import { useThrottledCallback } from "@/hooks/use-throttled-callback";

export interface InstallModalProps {
  modalVisible: boolean;
  esimCode: string;
  showInstructions: boolean;
  copyToClipboard: () => void;
  setShowInstructions: (show: boolean) => void;
  shareQRCode: () => void;
  saveQRCode: () => void;
  setModalVisible: (visible: boolean) => void;
  qrRef?: React.RefObject<View | null>;
}

export function InstallModal(props: InstallModalProps) {
  const ref = useRef<ScrollView>(null);
  const saveQRCode = useThrottledCallback(props.saveQRCode, 1000)
  const shareQRCode = useThrottledCallback(props.shareQRCode, 1000)

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={props.modalVisible}
      onRequestClose={() => props.setModalVisible(false)}
    >
      <View style={$styles.modalOverlay}>
        <View style={$styles.modalContent}>
          <View style={$styles.modalHeader}>
            <Text style={$styles.modalTitle}>Install eSIM</Text>
            <IconButton
              icon="close"
              iconColor="#666"
              size={24}
              onPress={() => props.setModalVisible(false)}
            />
          </View>

          <ScrollView ref={ref} showsVerticalScrollIndicator={false}>
            <View style={$styles.qrContainer}>
              <View ref={props.qrRef} collapsable={false}>
                <QRCode
                  value={props.esimCode}
                  color={brandGreen}
                  shapeOptions={{
                    shape: "rounded",
                    eyePatternShape: "rounded",
                    eyePatternGap: 0,
                    gap: 0,
                  }}
                  logo={
                    <Image
                      source={require("@/assets/app-logo.png")}
                      style={{ width: 32, height: 32 }}
                    />
                  }
                  size={180}
                />
              </View>
            </View>

            <View style={$styles.actionButtons}>
              <TouchableOpacity
                style={$styles.actionButton}
                onPressIn={saveQRCode}
              >
                <View style={$styles.actionButtonContent}>
                  <Text style={$styles.actionButtonIcon}>💾</Text>
                  <Text style={$styles.actionButtonText}>Save to Gallery</Text>
                  <Text style={$styles.actionButtonSubtext}>
                    Save QR code to scan later
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={$styles.actionButton}
                onPressIn={shareQRCode}
              >
                <View style={$styles.actionButtonContent}>
                  <Text style={$styles.actionButtonIcon}>📤</Text>
                  <Text style={$styles.actionButtonText}>Share QR Code</Text>
                  <Text style={$styles.actionButtonSubtext}>
                    Open with QR scanner app
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={$styles.actionButton}
                onPressIn={() => {
                  props.setShowInstructions(!props.showInstructions);
                  ref.current?.scrollToEnd();
                }}
              >
                <View style={$styles.actionButtonContent}>
                  <Text style={$styles.actionButtonIcon}>📋</Text>
                  <Text style={$styles.actionButtonText}>Manual Setup</Text>
                  <Text style={$styles.actionButtonSubtext}>
                    Enter code manually
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {props.showInstructions && (
              <View style={$styles.instructionsContainer}>
                <Text style={$styles.instructionsTitle}>
                  Manual Installation
                </Text>

                <View style={$styles.instructionStep}>
                  <Text style={$styles.stepNumber}>1</Text>
                  <Text style={$styles.stepText}>
                    Go to Settings → Network & Internet → SIMs
                  </Text>
                </View>

                <View style={$styles.instructionStep}>
                  <Text style={$styles.stepNumber}>2</Text>
                  <Text style={$styles.stepText}>
                    Tap "Add eSIM" → "Use activation code"
                  </Text>
                </View>

                <View style={$styles.instructionStep}>
                  <Text style={$styles.stepNumber}>3</Text>
                  <Text style={$styles.stepText}>
                    Paste the activation code below
                  </Text>
                </View>

                <View style={$styles.codeContainer}>
                  <Text style={$styles.codeLabel}>Activation Code:</Text>
                  <View style={$styles.codeBox}>
                    <Text style={$styles.codeText} selectable>
                      {props.esimCode}
                    </Text>
                  </View>
                </View>

                <View style={$styles.manualActions}>
                  <TouchableOpacity
                    style={$styles.manualButton}
                    onPressIn={props.copyToClipboard}
                  >
                    <Text style={$styles.manualButtonText}>📋 Copy Code</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
