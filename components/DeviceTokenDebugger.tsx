import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '@/context/auth-context';
import { createDevice } from '@/service/vpnService';

export default function DeviceTokenDebugger() {
  const { deviceToken, setDeviceToken, deviceTokenLoading } = useAuth();
  const [testing, setTesting] = useState(false);

  const testCreateDevice = async () => {
    setTesting(true);
    try {
      console.log("🧪 Testing device creation...");
      const token = await createDevice();
      console.log("🧪 Test: Device token created:", token);
      
      await setDeviceToken(token);
      console.log("🧪 Test: Device token saved");
      
      Alert.alert("Success", `Device token created and saved: ${token}`);
    } catch (error) {
      console.error("🧪 Test failed:", error);
      Alert.alert("Error", `Failed to create device token: ${error}`);
    } finally {
      setTesting(false);
    }
  };

  const clearDeviceToken = async () => {
    try {
      await setDeviceToken("");
      console.log("🧪 Device token cleared");
      Alert.alert("Success", "Device token cleared");
    } catch (error) {
      console.error("🧪 Failed to clear device token:", error);
      Alert.alert("Error", "Failed to clear device token");
    }
  };

  return (
    <View style={{ padding: 20, backgroundColor: '#f0f0f0', margin: 10, borderRadius: 10 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
        Device Token Debugger
      </Text>
      
      <Text style={{ marginBottom: 5 }}>
        Current Device Token: {deviceToken || 'NULL'}
      </Text>
      
      <Text style={{ marginBottom: 10 }}>
        Loading: {deviceTokenLoading ? 'YES' : 'NO'}
      </Text>
      
      <TouchableOpacity
        style={{
          backgroundColor: testing ? '#ccc' : '#007AFF',
          padding: 10,
          borderRadius: 5,
          marginBottom: 10,
          alignItems: 'center'
        }}
        onPress={testCreateDevice}
        disabled={testing}
      >
        <Text style={{ color: 'white', fontWeight: 'bold' }}>
          {testing ? 'Testing...' : 'Test Create Device'}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={{
          backgroundColor: '#FF3B30',
          padding: 10,
          borderRadius: 5,
          alignItems: 'center'
        }}
        onPress={clearDeviceToken}
      >
        <Text style={{ color: 'white', fontWeight: 'bold' }}>
          Clear Device Token
        </Text>
      </TouchableOpacity>
    </View>
  );
} 