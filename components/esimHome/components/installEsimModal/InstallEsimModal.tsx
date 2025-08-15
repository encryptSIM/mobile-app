import { Modal, View, ScrollView, TouchableOpacity, Platform } from "react-native";
import { IconButton, Text } from "react-native-paper";
import QRCode from "react-native-qrcode-svg";
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

  const getInstructionsForPlatform = () => {
    if (Platform.OS === 'ios') {
      return [
        "Go to Settings → Cellular → Add Cellular Plan",
        "Tap \"Use QR Code\" or \"Enter Details Manually\"",
        "Scan the QR code or paste the activation code below"
      ];
    } else if (Platform.OS === 'android') {
      return [
        "Go to Settings → Network & Internet → SIMs",
        "Tap \"Add eSIM\" → \"Use activation code\"",
        "Paste the activation code below"
      ];
    } else {
      return [
        "Open your mobile device's eSIM settings",
        "Select \"Add eSIM\" or \"Add Cellular Plan\"",
        "Use the QR code or enter the activation code manually"
      ];
    }
  };

  const instructions = getInstructionsForPlatform();

  // Only show save/share buttons on mobile platforms
  const showMobileActions = Platform.OS !== 'web';

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
            {Platform.OS === 'web' && (
              <View style={$styles.webNotice}>
                <Text style={$styles.webNoticeIcon}>📱</Text>
                <Text style={$styles.webNoticeTitle}>Use Your Mobile Device</Text>
                <Text style={$styles.webNoticeText}>
                  eSIMs can only be installed directly on your mobile device.
                  Copy the code below or scan the QR code with your phone.
                </Text>
              </View>
            )}

            <View style={$styles.qrContainer}>
              <View ref={props.qrRef} collapsable={false} style={$styles.qrWrapper}>
                <QRCode
                  value={props.esimCode}
                  size={180}
                  color={brandGreen}
                  backgroundColor="transparent"
                  logo={require("@/assets/app-logo.png")}
                  logoSize={32}
                  logoBackgroundColor="white"
                  logoMargin={4}
                  logoBorderRadius={16}
                  quietZone={0}
                  enableLinearGradient={false}
                />
              </View>
            </View>

            <View style={$styles.actionButtons}>
              {showMobileActions && (
                <>
                  <TouchableOpacity
                    style={$styles.actionButton}
                    onPressIn={saveQRCode}
                    activeOpacity={0.7}
                  >
                    <View style={$styles.actionButtonContent}>
                      <View style={$styles.actionButtonIconContainer}>
                        <Text style={$styles.actionButtonIcon}>💾</Text>
                      </View>
                      <Text style={$styles.actionButtonText}>Save to Gallery</Text>
                      <Text style={$styles.actionButtonSubtext}>
                        Save QR code to scan later
                      </Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={$styles.actionButton}
                    onPressIn={shareQRCode}
                    activeOpacity={0.7}
                  >
                    <View style={$styles.actionButtonContent}>
                      <View style={$styles.actionButtonIconContainer}>
                        <Text style={$styles.actionButtonIcon}>📤</Text>
                      </View>
                      <Text style={$styles.actionButtonText}>Share QR Code</Text>
                      <Text style={$styles.actionButtonSubtext}>
                        Open with QR scanner app
                      </Text>
                    </View>
                  </TouchableOpacity>
                </>
              )}

              <TouchableOpacity
                style={$styles.actionButton}
                onPressIn={() => {
                  props.setShowInstructions(!props.showInstructions);
                  setTimeout(() => {
                    ref.current?.scrollToEnd({ animated: true });
                  }, 100);
                }}
                activeOpacity={0.7}
              >
                <View style={$styles.actionButtonContent}>
                  <View style={$styles.actionButtonIconContainer}>
                    <Text style={$styles.actionButtonIcon}>📋</Text>
                  </View>
                  <Text style={$styles.actionButtonText}>
                    {Platform.OS === 'web' ? 'Setup Instructions' : 'Manual Setup'}
                  </Text>
                  <Text style={$styles.actionButtonSubtext}>
                    {Platform.OS === 'web'
                      ? 'View step-by-step guide'
                      : 'Enter code manually'
                    }
                  </Text>
                </View>
              </TouchableOpacity>

              {Platform.OS === 'web' && (
                <TouchableOpacity
                  style={[$styles.actionButton, $styles.primaryActionButton]}
                  onPressIn={props.copyToClipboard}
                  activeOpacity={0.7}
                >
                  <View style={$styles.actionButtonContent}>
                    <View style={[$styles.actionButtonIconContainer, $styles.primaryIconContainer]}>
                      <Text style={$styles.actionButtonIcon}>📋</Text>
                    </View>
                    <Text style={[$styles.actionButtonText, $styles.primaryActionText]}>Copy Activation Code</Text>
                    <Text style={$styles.actionButtonSubtext}>
                      Copy to use on your mobile device
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>

            {props.showInstructions && (
              <View style={$styles.instructionsContainer}>
                <Text style={$styles.instructionsTitle}>
                  {Platform.OS === 'web' ? 'Installation Guide' : 'Manual Installation'}
                </Text>
                <Text style={$styles.instructionsSubtitle}>
                  {Platform.OS === 'ios' ? 'iOS Instructions' :
                    Platform.OS === 'android' ? 'Android Instructions' :
                      'Mobile Device Instructions'}
                </Text>

                {instructions.map((instruction, index) => (
                  <View key={index} style={$styles.instructionStep}>
                    <Text style={$styles.stepNumber}>{index + 1}</Text>
                    <Text style={$styles.stepText}>
                      {instruction}
                    </Text>
                  </View>
                ))}

                <View style={$styles.codeContainer}>
                  <Text style={$styles.codeLabel}>Activation Code:</Text>
                  <View style={$styles.codeBox}>
                    <Text style={$styles.codeText} selectable>
                      {props.esimCode}
                    </Text>
                  </View>
                  <Text style={$styles.codeHelper}>
                    {Platform.OS === 'web'
                      ? 'Copy this code and enter it on your mobile device'
                      : 'Tap and hold to select all, then copy'
                    }
                  </Text>
                </View>

                <View style={$styles.manualActions}>
                  <TouchableOpacity
                    style={$styles.manualButton}
                    onPressIn={props.copyToClipboard}
                    activeOpacity={0.8}
                  >
                    <Text style={$styles.manualButtonText}>📋 Copy Code</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Add some bottom padding for better scrolling */}
            <View style={{ height: 20 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
