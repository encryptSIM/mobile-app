import { $api, Sim } from "@/api/api";
import { brandGreen } from "@/components/app-providers";
import { SIMS } from "@/components/checkout/hooks/useCheckout";
import { useWalletUi } from "@/components/solana/use-wallet-ui";
import { sizing } from "@/constants/sizing";
import { useSharedState } from "@/hooks/use-provider";
import * as Clipboard from "expo-clipboard";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";
import React, { useRef, useState } from "react";
import { Alert, Image, Platform, TouchableOpacity, View } from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";
import { QrCodeSvg } from "react-native-qr-svg";
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
  const [, setSims] = useSharedState<Sim[]>(SIMS.key);
  const [, setSelectedSim] = useSharedState<Sim | null>(SELECTED_SIM.key);
  const [copied, setCopied] = useState<boolean>(false)
  const { account } = useWalletUi();

  const setSimInstalledMut = $api.useMutation("post", "/mark-sim-installed", {
    onSuccess: () => {
      setSims((prev) =>
        prev.map((sim) => {
          if (sim.iccid === props.sim.iccid) {
            return {
              ...sim,
              installed: true,
            };
          }
          return sim;
        })
      );
      setSelectedSim((prev) => ({
        ...prev!,
        installed: true,
      }));
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const saveQRCode = async () => {
    try {
      if (Platform.OS === "web") {
        await downloadQRCodeForWeb();
        return;
      }

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

  const downloadQRCodeForWeb = async () => {
    try {
      if (Platform.OS !== "web") return;

      await new Promise((resolve) => setTimeout(resolve, 100));

      const uri = await captureRef(modalQrRef, {
        format: "png",
        quality: 1,
        result: "base64",
      });

      const link = document.createElement("a");
      link.href = `data:image/png;base64,${uri}`;
      link.download = "esim-qr-code.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      Alert.alert("Success! 📱", "QR code downloaded to your device.", [
        { text: "OK" },
      ]);
    } catch (error) {
      console.error("Error downloading QR code:", error);
      Alert.alert("Error", "Failed to download QR code. Please try again.");
    }
  };

  const shareQRCode = async () => {
    try {
      if (Platform.OS === "web") {
        if (navigator.share) {
          await new Promise((resolve) => setTimeout(resolve, 100));

          const uri = await captureRef(modalQrRef, {
            format: "png",
            quality: 1,
            result: "base64",
          });

          const blob = await (
            await fetch(`data:image/png;base64,${uri}`)
          ).blob();
          const file = new File([blob], "esim-qr-code.png", {
            type: "image/png",
          });

          await navigator.share({
            title: "eSIM QR Code",
            text: "Scan this QR code to install your eSIM",
            files: [file],
          });
        } else {
          await copyToClipboard();
        }
        return;
      }

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
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      Alert.alert("Copied! 📋", "Activation code copied to clipboard");
    } catch (error) {
      Alert.alert("Error", "Failed to copy to clipboard");
    }
  };

  return (
    <View style={$styles.root}>
      <View style={$styles.header}>
        <Text style={$styles.headerTitle}>Activate Your eSIM</Text>
        <Text style={$styles.headerSubtitle}>
          Quick, secure, and hassle-free installation.
        </Text>
      </View>

      <View ref={qrRef} collapsable={false} style={$styles.qrContainer}>
        <QrCodeSvg
          value={props?.sim?.qrcode || "123"}
          frameSize={sizing.qr}
          contentCells={12}
          backgroundColor="transparent"
          dotColor={brandGreen}
          contentStyle={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          errorCorrectionLevel="high"
          content={
            <Image
              source={require("@/assets/app-logo.png")}
              style={{
                width: sizing.icon,
                height: sizing.icon,
                borderRadius: 10,
                margin: sizing.margin / 2,
              }}
              resizeMode="contain"
            />
          }
        />
      </View>

      <TouchableOpacity
        style={$styles.topUpButton}
        onPress={() => setModalVisible(true)}
        accessibilityLabel="Install eSIM"
      >
        <Text style={$styles.installButtonText}>Start Installation</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() =>
          setSimInstalledMut.mutate({
            body: {
              installed: true,
              iccid: props.sim.iccid,
              id: account?.address,
            },
          })
        }
        style={$styles.markCompleteButton}
        disabled={setSimInstalledMut.isPending}
      >
        {!setSimInstalledMut.isPending ? (
          <Text style={$styles.installedText}>
            Already installed? Mark as complete
          </Text>
        ) : (
          <ActivityIndicator color="#9CA1AB" size="small" />
        )}
      </TouchableOpacity>

      <InstallModal
        copied={copied}
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
