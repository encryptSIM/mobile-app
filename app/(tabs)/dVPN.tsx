import React, { useEffect, useState } from "react";
import {
  Alert,
  ImageBackground,
  NativeModules,
  StyleSheet,
  Text,
  View,
  Switch,
  TouchableOpacity,
  Modal,
} from "react-native";
import { CountrySelector } from "../../components/CountrySelector";
import { PowerButton } from "../../components/PowerButton";
import { PromoCard } from "../../components/PromoCard";
import { TopBar } from "../../components/TopBar";
import { useWireGuardVpn } from "../../hooks/use-wireguard-vpn";
import { useV2RayVpn } from "../../hooks/use-v2ray-vpn";
import V2RayTestComponent from "../../components/V2RayTestComponent";

// Debug: Log available native modules
console.log("Available NativeModules:", Object.keys(NativeModules));
console.log("WireGuardVpnModule available:", NativeModules.WireGuardVpnModule);

// Demo configs (replace with real values in production)
const WG_CONFIG_STRING = `
[Interface]
PrivateKey = SDEl3+M/fm8n4N8ZyVrT8EZchBMP6zb834FwP/2hyHI=
Address = 10.7.0.2/24, fddd:2c4:2c4:2c4::2/64
DNS = 8.8.8.8, 8.8.4.4

[Peer]
PublicKey = M7h7FzutsWbuw2MFe2Y+vSWmBQQzbLWlwunzAYR0hik=
Endpoint = 103.186.64.43:51820
AllowedIPs = 0.0.0.0/0, ::/0
PresharedKey = KocIKr+yB9oAhayOHpoXQ862bjw6EWXQrap6GttKJDs=
PersistentKeepalive = 25
`.trim();

const VMESS_LINK =
  "vmess://eyJ2IjoiMiIsInBzIjoiRmFlcmllX0ZhbGxzIiwiYWRkIjoiMTMyLjIyNi4yMDIuMTciLCJwb3J0IjoiNzc3NyIsImlkIjoiOTY3NzY1ZDQtYzIzYS1mZTQ5LWEyYmEtYmJmYzA5YzY1MTQzIiwiYWlkIjoiMCIsIm5ldCI6IndzIiwidHlwZSI6Im5vbmUiLCJob3N0IjoiIiwicGF0aCI6Ii8iLCJ0bHMiOiJ0bHMifQ==";

export default function DVpnScreen() {
  const [useV2Ray, setUseV2Ray] = useState(false);
  const [showDebugModal, setShowDebugModal] = useState(false);

  // WireGuard hook
  const {
    isSupported: wgSupported,
    isInitialized,
    status,
    statistics,
    isLoading,
    error,
    connect: connectWG,
    disconnect: disconnectWG,
  } = useWireGuardVpn();

  // V2Ray hook
  const {
    isRunning: isV2RayRunning,
    error: v2rayError,
    startVpn,
    stopVpn,
  } = useV2RayVpn();

  // Connected state, based on which mode
  const isConnected = useV2Ray ? isV2RayRunning : status === "connected";

  // Alert on errors
  useEffect(() => {
    if (error) Alert.alert("WireGuard Error", error);
    if (v2rayError) Alert.alert("V2Ray Error", v2rayError);
  }, [error, v2rayError]);

  // Power button action handler
  const handleToggleVPN = async () => {
    try {
      if (isConnected) {
        if (useV2Ray) {
          await stopVpn();
          Alert.alert("Disconnected", "V2Ray VPN disconnected");
        } else {
          await disconnectWG();
          Alert.alert("Disconnected", "WireGuard VPN disconnected");
        }
      } else {
        if (useV2Ray) {
          await startVpn(VMESS_LINK);
          Alert.alert("Connected", "V2Ray VPN connected");
        } else {
          await connectWG(WG_CONFIG_STRING);
          Alert.alert("Connected", "WireGuard VPN connected");
        }
      }
    } catch (e: any) {
      Alert.alert("Error", e?.message || String(e));
    }
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../../assets/images/main-background.png")}
        style={styles.background}
        imageStyle={styles.imageStyle}
      >
        <TopBar onAvatarPress={() => console.log("Avatar pressed")} />

        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Use V2Ray</Text>
          <Switch value={useV2Ray} onValueChange={setUseV2Ray} />
        </View>

        <CountrySelector
          country="US"
          flagUrl="https://www.countryflags.io/us/flat/64.png"
        />

        <PowerButton onPress={handleToggleVPN} disabled={isLoading} />

        <PromoCard
          title="Get 10% off your first purchase"
          subtitle="Use code: DVPN10"
        />

        <View style={styles.debugContainer}>
          <Text style={styles.debugText}>
            Current Mode: {useV2Ray ? "V2Ray" : "WireGuard"}
          </Text>
          <Text style={styles.debugText}>
            Status: {isConnected ? "Connected" : "Disconnected"}
          </Text>
          <TouchableOpacity
            style={styles.debugButton}
            onPress={() => setShowDebugModal(true)}
          >
            <Text style={styles.debugButtonText}>Debug V2Ray</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>

      <Modal
        visible={showDebugModal}
        animationType="slide"
        presentationStyle="formSheet"
        onRequestClose={() => setShowDebugModal(false)}
      >
        <View style={styles.modalHeader}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowDebugModal(false)}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
        <V2RayTestComponent />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1E263C" },
  background: { flex: 1, paddingTop: 48, paddingHorizontal: 16 },
  imageStyle: { resizeMode: "cover" },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  switchLabel: { color: "white", marginRight: 8 },
  debugContainer: {
    marginTop: 16,
    padding: 8,
    backgroundColor: "rgba(0,0,0,0.1)",
    borderRadius: 8,
  },
  debugText: { color: "white", fontSize: 12, marginVertical: 2 },
  debugButton: {
    backgroundColor: "#007AFF",
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
    alignItems: "center",
  },
  debugButtonText: { color: "white", fontSize: 12, fontWeight: "600" },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  closeButton: {
    backgroundColor: "#FF3B30",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  closeButtonText: { color: "white", fontWeight: "600" },
});
