import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { NativeModules } from "react-native";

const { V2RayModule, VpnPermission } = NativeModules;

export default function V2RayTestComponent() {
  const [logs, setLogs] = useState<string[]>([]);
  const [testing, setTesting] = useState(false);
  const [vpnPermissionGranted, setVpnPermissionGranted] = useState(false);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, `[${timestamp}] ${message}`]);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const testLibraryAccess = async () => {
    try {
      addLog("Testing V2Ray library access...");
      const result = await V2RayModule.testLibraryAccess();
      addLog(`✅ Library accessible: ${JSON.stringify(result)}`);
    } catch (error: any) {
      addLog(`❌ Library access failed: ${error.message}`);
    }
  };

  const testInitialization = async () => {
    try {
      addLog("Testing V2Ray initialization...");
      const result = await V2RayModule.testInitialization();
      addLog(`✅ Initialization successful: ${JSON.stringify(result)}`);
    } catch (error: any) {
      addLog(`❌ Initialization failed: ${error.message}`);
    }
  };

  const testVersion = async () => {
    try {
      addLog("Testing V2Ray version check...");
      const version = await V2RayModule.checkVersion();
      addLog(`✅ Version: ${version}`);
    } catch (error: any) {
      addLog(`❌ Version check failed: ${error.message}`);
    }
  };

  const testVmessValidation = async () => {
    try {
      addLog("Testing vmess link validation...");
      // Test with invalid vmess link first
      const invalidResult = await V2RayModule.validateVmessLink("invalid-link");
      addLog(`✅ Invalid vmess validation: ${invalidResult}`);

      // Test with vmess format (without actual data)
      const vmessResult = await V2RayModule.validateVmessLink("vmess://");
      addLog(`✅ Empty vmess validation: ${vmessResult}`);
    } catch (error: any) {
      addLog(`❌ Vmess validation failed: ${error.message}`);
    }
  };

  const testVpnPermission = async () => {
    try {
      addLog("Testing VPN permission...");
      const granted = await VpnPermission.requestVpnPermission();
      setVpnPermissionGranted(granted);
      addLog(`✅ VPN permission granted: ${granted}`);
      return granted;
    } catch (error: any) {
      addLog(`❌ VPN permission failed: ${error.message}`);
      setVpnPermissionGranted(false);
      return false;
    }
  };

  const testVpnConnection = async () => {
    try {
      addLog("Testing VPN connection...");

      // Create a sample vmess configuration for testing
      const testVmessLink =
        "vmess://eyJhZGQiOiIxLjIuMy40IiwiYWlkIjoiMCIsImhvc3QiOiIiLCJpZCI6IjEyMzQ1Njc4LTEyMzQtMTIzNC0xMjM0LTEyMzQ1Njc4OTBhYiIsIm5ldCI6InRjcCIsInBhdGgiOiIiLCJwb3J0IjoiNDQzIiwicHMiOiJUZXN0IFNlcnZlciIsInNjeSI6ImF1dG8iLCJzbmkiOiIiLCJ0bHMiOiIiLCJ0eXBlIjoibm9uZSIsInYiOiIyIn0=";

      addLog("Starting VPN service...");
      const result = await V2RayModule.startVpnService(testVmessLink);
      addLog(`✅ VPN service started: ${result}`);

      // Wait a bit for the VPN to establish
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Check VPN status
      const status = await V2RayModule.getStatus();
      addLog(`✅ VPN status: ${JSON.stringify(status)}`);

      // Stop VPN after testing
      addLog("Stopping VPN service...");
      const stopResult = await V2RayModule.stopVpnService();
      addLog(`✅ VPN service stopped: ${stopResult}`);
    } catch (error: any) {
      addLog(`❌ VPN connection test failed: ${error.message}`);
    }
  };

  const runAllTests = async () => {
    setTesting(true);
    clearLogs();

    addLog("🚀 Starting comprehensive V2Ray tests...");

    // Test 1: Library access
    await testLibraryAccess();
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Test 2: Initialization
    await testInitialization();
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Test 3: Version check
    await testVersion();
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Test 4: Vmess validation
    await testVmessValidation();
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Test 5: VPN permission
    const permissionGranted = await testVpnPermission();
    if (permissionGranted) {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Test 6: VPN connection
      await testVpnConnection();
    } else {
      addLog("⚠️  Skipping VPN tests - permission not granted");
    }

    addLog("✅ All tests completed");
    setTesting(false);
  };

  const testVpnOnly = async () => {
    setTesting(true);
    addLog("🔒 Testing VPN functionality only...");

    const permissionGranted = await testVpnPermission();
    if (permissionGranted) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await testVpnConnection();
    }

    setTesting(false);
  };

  const testServerConnectivity = async () => {
    try {
      addLog("🔗 Testing V2Ray server connectivity...");
      const result = await V2RayModule.testServerConnectivity();
      addLog(`✅ Server connectivity test successful!`);
      addLog(`📍 Server: ${result.serverAddress}:${result.serverPort}`);
      addLog(`📊 Status: ${result.status}`);
    } catch (error: any) {
      addLog(`❌ Server connectivity test failed: ${error.message}`);
      if (error.message.includes("timeout")) {
        addLog("💡 This could be due to:");
        addLog("   • Server is down or unreachable");
        addLog("   • Network firewall blocking connections");
        addLog("   • Your device is on VPN that blocks the server");
      }
    }
  };

  const testProxyConnection = async () => {
    try {
      addLog("🌐 Testing V2Ray proxy connection...");
      const result = await V2RayModule.testProxyConnection();
      addLog(`✅ Proxy test successful!`);
      addLog(`🌍 External IP: ${result.externalIp}`);
      addLog(`📊 Response: ${result.status}`);
      addLog(`🔗 Full response: ${result.fullResponse}`);
    } catch (error: any) {
      addLog(`❌ Proxy test failed: ${error.message}`);
      if (
        error.message.includes("timeout") ||
        error.message.includes("not accessible")
      ) {
        addLog("💡 This could be due to:");
        addLog("   • V2Ray core not running properly");
        addLog("   • Server connectivity issues");
        addLog("   • Network conflicts with existing VPN");
        addLog("   • Try testing server connectivity first");
      }
    }
  };

  return (
    <View className="flex-1 p-4 bg-gray-100">
      <Text className="text-xl font-bold mb-4">V2Ray Debug Console</Text>

      <View className="mb-4 p-3 bg-white rounded">
        <Text className="text-sm font-medium">
          VPN Permission:{" "}
          {vpnPermissionGranted ? "✅ Granted" : "❌ Not Granted"}
        </Text>
      </View>

      <View className="flex-row flex-wrap gap-2 mb-4">
        <TouchableOpacity
          onPress={runAllTests}
          disabled={testing}
          className={`px-4 py-2 rounded ${
            testing ? "bg-gray-400" : "bg-blue-500"
          }`}
        >
          <Text className="text-white font-medium">
            {testing ? "Testing..." : "Run All Tests"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={testVpnOnly}
          disabled={testing}
          className="px-4 py-2 rounded bg-purple-500"
        >
          <Text className="text-white font-medium">Test VPN Only</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={testVpnPermission}
          disabled={testing}
          className="px-4 py-2 rounded bg-orange-500"
        >
          <Text className="text-white font-medium">Request VPN Permission</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={testServerConnectivity}
          disabled={testing}
          className="px-4 py-2 rounded bg-blue-500"
        >
          <Text className="text-white font-medium">Test Server</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={testProxyConnection}
          disabled={testing}
          className="px-4 py-2 rounded bg-green-500"
        >
          <Text className="text-white font-medium">Test Proxy</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={testLibraryAccess}
          disabled={testing}
          className="px-4 py-2 rounded bg-green-500"
        >
          <Text className="text-white font-medium">Test Library</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={clearLogs}
          className="px-4 py-2 rounded bg-red-500"
        >
          <Text className="text-white font-medium">Clear Logs</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 bg-black p-4 rounded">
        {logs.map((log, index) => (
          <Text key={index} className="text-green-400 text-xs mb-1 font-mono">
            {log}
          </Text>
        ))}
        {logs.length === 0 && (
          <Text className="text-gray-500 text-center">
            No logs yet. Run tests to see output.
          </Text>
        )}
      </ScrollView>
    </View>
  );
}
