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
import { createDevice } from "../../service/vpnService";
import { ServerSelectionModal } from "../../components/ServerSelectionModal";
import VPNServerTester from "../../components/VPNServerTester";
// import { useV2RayVpn } from "../../hooks/use-v2ray-vpn";
// import V2RayTestComponent from "../../components/V2RayTestComponent";

const { VpnPermission } = NativeModules;

// Debug: Log available native modules
console.log("Available NativeModules:", Object.keys(NativeModules));
console.log("WireGuardVpnModule available:", NativeModules.WireGuardVpnModule);
console.log("VpnPermission available:", VpnPermission);
// Removed hardcoded config - now using dynamic server selection

// Your original VMESS config - test this first
// const VMESS_LINK_ORIGINAL =
//   "vmess://eyJ2IjoiMiIsInBzIjoiRmFlcmllX0ZhbGxzIiwiYWRkIjoiMTMyLjIyNi4yMDIuMTciLCJwb3J0IjoiNzc3NyIsImlkIjoiOTY3NzY1ZDQtYzIzYS1mZTQ5LWEyYmEtYmJmYzA5YzY1MTQzIiwiYWlkIjoiMCIsIm5ldCI6IndzIiwidHlwZSI6Im5vbmUiLCJob3N0IjoiIiwicGF0aCI6Ii8iLCJ0bHMiOiJ0bHMifQ==";

// Test configs from public sources (unreliable - use for testing only!)
// const TEST_VMESS_CONFIGS = [
//   // Test config 1: US server (may be slow/unreliable)
//   "vmess://eyJhZGQiOiIxMDguMTgxLjEwLjE3IiwiYWlkIjoiMCIsImFscG4iOiIiLCJmcCI6IiIsImhvc3QiOiJtdG4uem0iLCJpZCI6ImE2NWViODQwLTFjYzUtMTFmMC1iMDMwLTIwNWM2ZDVmNWQ3OCIsIm5ldCI6IndzIiwicGF0aCI6IlwvZDhxbnhteWUiLCJwb3J0IjoiODAiLCJwcyI6Ilx1ZDgzY1x1ZGRmYVx1ZDgzY1x1ZGRmOFtvcGVucHJveHlsaXN0LmNvbV0gdm1lc3MtVVMiLCJzY3kiOiJhdXRvIiwic25pIjoiIiwidGxzIjoiIiwidHlwZSI6Ii0tLSIsInYiOiIyIiwic2tpcC1jZXJ0LXZlcmlmeSI6dHJ1ZX0=",

//   // Test config 2: Alternative (from GitHub repos - may expire)
//   "vmess://eyJ2IjoiMiIsInBzIjoidGVzdCIsImFkZCI6IjEwNC4zMS4xNi4xNTIiLCJwb3J0IjoiODAiLCJpZCI6IjMwZjljZGMyLWQ5ZGQtNDQwMS1iOGM5LWJhZmIyZGJkZDZjYSIsImFpZCI6IjAiLCJuZXQiOiJ3cyIsInR5cGUiOiJub25lIiwiaG9zdCI6InVzYS5rYXlhbGFodG0ueHl6IiwicGF0aCI6Ii9hdXRvcGFuZWwiLCJ0bHMiOiIifQ==",
// ];

// Currently selected config (default to original)
// const VMESS_LINK = VMESS_LINK_ORIGINAL;

export default function DVpnScreen() {
  const { deviceToken, setDeviceToken, deviceTokenLoading } = {} as any
  const [useV2Ray, setUseV2Ray] = useState(false);
  const [showDebugModal, setShowDebugModal] = useState(false);
  const [showServerModal, setShowServerModal] = useState(false);
  const [showVPNTester, setShowVPNTester] = useState(false);
  const [vpnPermissionGranted, setVpnPermissionGranted] = useState<
    boolean | null
  >(null);
  const [externalIP, setExternalIP] = useState<string | null>(null);
  const [testingIP, setTestingIP] = useState(false);
  const [selectedConfigIndex, setSelectedConfigIndex] = useState(0);

  // Server selection state
  const [selectedServer, setSelectedServer] = useState<{
    country: string;
    city: string;
    server: string;
  } | null>(null);
  const [vpnConfig, setVpnConfig] = useState<string | null>(null);

  console.log("deviceToken", deviceToken);
  console.log("selectedServer", selectedServer);

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
    initialize,
  } = useWireGuardVpn();

  // V2Ray hook
  // const {
  //   isRunning: isV2RayRunning,
  //   error: v2rayError,
  //   startVpn,
  //   stopVpn,
  //   testServerConnectivity,
  //   testV2RayProxies,
  //   testProxyConnection,
  // } = useV2RayVpn();

  // Connected state, based on which mode
  const isConnected = status === "connected";

  // Alert on errors
  useEffect(() => {
    if (error) Alert.alert("WireGuard Error", error);
    // if (v2rayError) Alert.alert("V2Ray Error", v2rayError);
  }, [error]);

  // Check VPN permission before connecting
  const checkVpnPermission = async (): Promise<boolean> => {
    try {
      console.log("Checking VPN permission...");
      const granted = await VpnPermission.requestVpnPermission();
      console.log("VPN permission granted:", granted);
      setVpnPermissionGranted(granted);
      return granted;
    } catch (error: any) {
      console.error("VPN permission check failed:", error);
      setVpnPermissionGranted(false);
      Alert.alert(
        "Permission Error",
        error?.message || "Failed to check VPN permission"
      );
      return false;
    }
  };

  // Check permission on component mount
  useEffect(() => {
    const checkInitialPermission = async () => {
      // Just check if VpnPermission module is available without showing dialog
      if (VpnPermission) {
        console.log("VpnPermission module is available");
      }
    };
    checkInitialPermission();
  }, []);

  useEffect(() => {
    const ensureDeviceToken = async () => {
      if (!deviceToken && !deviceTokenLoading) {
        try {
          const newDeviceToken = await createDevice();
          await setDeviceToken(newDeviceToken);
        } catch (err) {
          console.error("Failed to fetch/set device token", err);
        }
      }
    };
    ensureDeviceToken();
  }, [deviceToken, deviceTokenLoading, setDeviceToken]);

  const handleServerSelect = (
    config: string,
    serverInfo: { country: string; city: string; server: string }
  ) => {
    console.log("🔄 Server selected:", serverInfo);
    console.log("🔄 Config received:", config);
    setSelectedServer(serverInfo);
    setVpnConfig(config);
  };

  const handleCountrySelectorPress = () => {
    setShowServerModal(true);
  };

  // Power button action handler
  const handleToggleVPN = async () => {
    try {
      if (isConnected) {
        await disconnectWG();
        Alert.alert("Disconnected", "WireGuard VPN disconnected");
      } else {
        // Check if server is selected
        if (!selectedServer || !vpnConfig) {
          Alert.alert(
            "No Server Selected",
            "Please select a server first by tapping on the country selector."
          );
          return;
        }

        console.log("Attempting to connect VPN...");
        const hasPermission = await checkVpnPermission();
        if (!hasPermission) {
          Alert.alert(
            "VPN Permission Required",
            "Please grant VPN permission to connect to the VPN service."
          );
          return;
        }

        console.log(
          "VPN permission granted, proceeding with initialization..."
        );
        await initialize();
        console.log("WireGuard initialized, proceeding with connection...");
        console.log("Using config for:", selectedServer);

        await connectWG(vpnConfig);
        Alert.alert(
          "Connected",
          `Connected to ${selectedServer.server} in ${selectedServer.city}, ${selectedServer.country}`
        );
      }
    } catch (e: any) {
      console.error("VPN toggle error:", e);
      Alert.alert("Error", e?.message || String(e));
    }
  };

  // Test server connectivity
  // const handleTestServer = async () => {
  //   setTestingIP(true);
  //   try {
  //     const result = await testServerConnectivity();
  //     Alert.alert(
  //       "Server Test",
  //       `✅ Server is reachable!\n\nServer: ${result.serverAddress}:${result.serverPort}\n\nYou can now try connecting to the VPN.`
  //     );
  //   } catch (e: any) {
  //     Alert.alert(
  //       "Server Test Failed",
  //       `❌ ${
  //         e?.message || String(e)
  //       }\n\n💡 If you're on VPN, try disabling it first to test the server.`
  //     );
  //   } finally {
  //     setTestingIP(false);
  //   }
  // };

  // Test V2Ray proxies (v2rayNG-style diagnostic)
  // const handleTestProxies = async () => {
  //   setTestingIP(true);
  //   try {
  //     const result = await testV2RayProxies();
  //     Alert.alert(
  //       "V2Ray Proxy Test",
  //       `HTTP Proxy: ${result.httpProxy}\n\nSOCKS Proxy: ${
  //         result.socksProxy
  //       }\n\nExternal IP: ${result.externalIp}\n\n${
  //         result.success
  //           ? "🎉 Proxies are working! This should fix the 26.26.26.1 issue."
  //           : "⚠️ Proxy issues detected. This explains why you're seeing 26.26.26.1."
  //       }`
  //     );
  //   } catch (e: any) {
  //     Alert.alert(
  //       "Proxy Test Failed",
  //       `❌ ${
  //         e?.message || String(e)
  //       }\n\n💡 This indicates V2Ray proxies are not running properly.`
  //     );
  //   } finally {
  //     setTestingIP(false);
  //   }
  // };

  // Test external IP function
  // const handleTestExternalIP = async () => {
  //   if (!isConnected) {
  //     Alert.alert("Not Connected", "Please connect to VPN first");
  //     return;
  //   }

  //   setTestingIP(true);
  //   try {
  //     const result = await testProxyConnection();
  //     setExternalIP(result.externalIp);
  //     Alert.alert(
  //       "External IP Test",
  //       `External IP: ${result.externalIp}\n\nThis means your VPN is ${
  //         result.externalIp.startsWith("26.26") ||
  //         result.externalIp.startsWith("192.168") ||
  //         result.externalIp.startsWith("10.") ||
  //         result.externalIp === "127.0.0.1"
  //           ? "NOT working properly - still showing local IP"
  //           : "WORKING! - showing external server IP"
  //       }`
  //     );
  //   } catch (e: any) {
  //     Alert.alert(
  //       "Test Failed",
  //       `${
  //         e?.message || String(e)
  //       }\n\n💡 Try testing server connectivity first, or disable any existing VPN.`
  //     );
  //     setExternalIP(null);
  //   } finally {
  //     setTestingIP(false);
  //   }
  // };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../../assets/images/main-background.png")}
        style={styles.background}
        imageStyle={styles.imageStyle}
      >
        <TopBar onAvatarPress={() => console.log("Avatar pressed")} />

        {/* <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Use V2Ray</Text>
          <Switch value={useV2Ray} onValueChange={setUseV2Ray} />
        </View> */}

        {useV2Ray && (
          <View style={styles.configSelectorContainer}>
            <Text style={styles.configSelectorLabel}>VMESS Config:</Text>
            <View style={styles.configButtonsContainer}>
              <TouchableOpacity
                style={[
                  styles.configButton,
                  selectedConfigIndex === 0 && styles.configButtonSelected,
                ]}
                onPress={() => setSelectedConfigIndex(0)}
              >
                <Text
                  style={[
                    styles.configButtonText,
                    selectedConfigIndex === 0 &&
                    styles.configButtonTextSelected,
                  ]}
                >
                  Your Server
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.configButton,
                  selectedConfigIndex === 1 && styles.configButtonSelected,
                ]}
                onPress={() => setSelectedConfigIndex(1)}
              >
                <Text
                  style={[
                    styles.configButtonText,
                    selectedConfigIndex === 1 &&
                    styles.configButtonTextSelected,
                  ]}
                >
                  Test 1 (US)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.configButton,
                  selectedConfigIndex === 2 && styles.configButtonSelected,
                ]}
                onPress={() => setSelectedConfigIndex(2)}
              >
                <Text
                  style={[
                    styles.configButtonText,
                    selectedConfigIndex === 2 &&
                    styles.configButtonTextSelected,
                  ]}
                >
                  Test 2 (Alt)
                </Text>
              </TouchableOpacity>
            </View>
            {selectedConfigIndex > 0 && (
              <Text style={styles.warningText}>
                ⚠️ Test configs are public/unreliable - use for testing only!
              </Text>
            )}
          </View>
        )}

        <CountrySelector
          country={
            selectedServer ? `${selectedServer.country}` : "Select Server"
          }
          flagUrl="https://www.countryflags.io/us/flat/64.png"
          onPress={handleCountrySelectorPress}
        />

        <PowerButton
          connected={isConnected}
          onPress={handleToggleVPN}
          disabled={isLoading}
        />

        <PromoCard
          title="Get 10% off your first purchase"
          subtitle="Use code: DVPN10"
        />

        <View style={styles.debugContainer}>
          <Text style={styles.debugText}>
            Status: {isConnected ? "Connected" : "Disconnected"}
          </Text>
          {selectedServer && (
            <Text style={styles.debugText}>
              Selected: {selectedServer.server} in {selectedServer.city},{" "}
              {selectedServer.country}
            </Text>
          )}

          <TouchableOpacity
            style={styles.debugButton}
            onPress={() => setShowVPNTester(true)}
          >
            <Text style={styles.debugButtonText}>Test VPN API</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>

      <ServerSelectionModal
        visible={showServerModal}
        onServerSelect={handleServerSelect}
        onClose={() => setShowServerModal(false)}
      />

      <Modal
        visible={showVPNTester}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowVPNTester(false)}
      >
        <View style={styles.modalHeader}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowVPNTester(false)}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
        <VPNServerTester />
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
  buttonRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  debugButton: {
    backgroundColor: "#007AFF",
    padding: 8,
    borderRadius: 6,
    alignItems: "center",
    flex: 1,
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
  configSelectorContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 8,
  },
  configSelectorLabel: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  configButtonsContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  configButton: {
    flex: 1,
    padding: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 6,
    alignItems: "center",
  },
  configButtonSelected: {
    backgroundColor: "#007AFF",
  },
  configButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
  },
  configButtonTextSelected: {
    fontWeight: "700",
  },
  warningText: {
    color: "#FFD60A",
    fontSize: 11,
    textAlign: "center",
    fontStyle: "italic",
  },
});
