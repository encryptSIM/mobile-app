import { $api, Sim } from "@/api/api";
import { brandGreen } from "@/components/app-providers";
import { SIMS } from "@/components/checkout/hooks/useCheckout";
import { useWalletUi } from "@/components/solana/use-wallet-ui";
import { useSharedState } from "@/hooks/use-provider";
import * as Clipboard from "expo-clipboard";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";
import React, { useRef, useState } from "react";
import { Alert, Image, TouchableOpacity, View } from "react-native";
import { ActivityIndicator, IconButton, Text } from "react-native-paper";
import QRCode from "react-native-qrcode-skia";
import { captureRef } from "react-native-view-shot";
import { SELECTED_SIM } from "../../hooks/useEsimHomeScreen";
import { InstallModal } from "../installEsimModal/InstallEsimModal";
import { $styles } from "./styles";

export interface InstallSimPanelProps {
  sim: Sim;
}

export function InstallSimPanel(props: InstallSimPanelProps) {
  const qrRef = useRef<View>(null);
  const modalQrRef = useRef<View>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [, setSims] = useSharedState<Sim[]>(SIMS.key)
  const [, setSelectedSim] = useSharedState<Sim | null>(SELECTED_SIM.key)
  const { account } = useWalletUi();
  const setSimInstalledMut = $api.useMutation('post', '/mark-sim-installed', {
    onSuccess: () => {
      setSims(prev => prev.map(sim => {
        if (sim.iccid === props.sim.iccid) {
          return ({
            ...sim,
            installed: true,
          })
        }
        return sim
      }))
      setSelectedSim(prev => ({
        ...prev!,
        installed: true
      }))
    },
    onError: (error) => {
      console.error(error)
    }
  })

  const saveQRCode = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission needed", "Please grant photo library access");
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 100));

      const uri = await captureRef(modalQrRef, {
        format: "png",
        quality: 1,
        result: "tmpfile",
      });

      const asset = await MediaLibrary.createAssetAsync(uri);
      await MediaLibrary.createAlbumAsync("eSIM QR Codes", asset, false);

      Alert.alert(
        "Success! 📱",
        "QR code saved to your gallery. You can now scan it with any QR scanner app.",
        [{ text: "OK" }]
      );
    } catch (error) {
      console.error("Error saving QR code:", error);
      Alert.alert("Error", "Failed to save QR code. Please try again.");
    }
  };

  const shareQRCode = async () => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 100));

      const uri = await captureRef(modalQrRef, {
        format: "png",
        quality: 1,
        result: "tmpfile",
      });

      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert("Error", "Sharing is not available on this device");
        return;
      }

      await Sharing.shareAsync(uri, {
        mimeType: "image/png",
        dialogTitle: "Open with QR Scanner to install eSIM",
      });
    } catch (error) {
      console.error("Error sharing QR code:", error);
      Alert.alert("Error", "Failed to share QR code");
    }
  };

  const copyToClipboard = async () => {
    try {
      await Clipboard.setStringAsync(props.sim?.qrcode);
      Alert.alert("Copied! 📋", "Activation code copied to clipboard");
    } catch (error) {
      Alert.alert("Error", "Failed to copy to clipboard");
    }
  };

  return (
    <View style={$styles.root}>
      <View style={$styles.header}>
        <IconButton icon={'sim-outline'} size={40} />
        <Text style={$styles.headerTitle}>Activate Your eSIM</Text>
        <Text style={$styles.headerSubtitle}>
          Quick, secure, and hassle-free installation.
        </Text>
      </View>

      <View ref={qrRef} collapsable={false}>
        <QRCode
          value={`${props?.sim?.qrcode}`}
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
              style={{ width: 40, height: 40 }}
            />
          }
          size={200}
        />
      </View>

      <TouchableOpacity
        style={$styles.topUpButton}
        onPress={() => setModalVisible(true)}
        accessibilityLabel="Install eSIM"
      >
        <Text style={$styles.installButtonText}>
          Start Installation
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={
          () => setSimInstalledMut.mutate({
            body: {
              installed: true,
              iccid: props.sim.iccid,
              id: account?.address
            }
          })
        }
      >
        {
          !setSimInstalledMut.isPending
            ? <Text style={$styles.installedText}>
              Already installed? Mark as complete
            </Text>
            : <ActivityIndicator />
        }
      </TouchableOpacity>

      <InstallModal
        esimCode={props.sim?.qrcode}
        modalVisible={modalVisible}
        showInstructions={showInstructions}
        copyToClipboard={copyToClipboard}
        setShowInstructions={setShowInstructions}
        shareQRCode={shareQRCode}
        saveQRCode={saveQRCode}
        setModalVisible={setModalVisible}
        qrRef={modalQrRef}
      />
    </View>
  );
}
