import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
} from "react-native";
import {
  getCountries,
  getCities,
  getServers,
  createCredentials,
} from "@/service/vpnService";

export default function VPNServerTester() {
  const deviceToken = ""
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const addResult = (step: string, data: any, success: boolean = true) => {
    const timestamp = new Date().toLocaleTimeString();
    setResults((prev) => [
      ...prev,
      {
        step,
        data,
        success,
        timestamp,
        type: success ? "success" : "error",
      },
    ]);
  };

  const testCompleteFlow = async () => {
    if (!deviceToken) {
      Alert.alert("Error", "No device token available");
      return;
    }

    setTesting(true);
    setResults([]);

    try {
      // Step 1: Get Countries
      addResult(
        "🔄 Testing",
        "Starting complete VPN server selection flow test",
        true
      );

      console.log("🧪 Step 1: Getting countries...");
      const countries = await getCountries(deviceToken);
      addResult("✅ Countries", countries, true);

      if (!countries || countries.length === 0) {
        addResult("❌ Error", "No countries returned from API", false);
        return;
      }

      // Step 2: Get Cities for first country
      const firstCountry = countries[0];
      console.log("🧪 Step 2: Getting cities for country:", firstCountry);
      const cities = await getCities(firstCountry.id, deviceToken);
      addResult("✅ Cities", { country: firstCountry, cities }, true);

      if (!cities || cities.length === 0) {
        addResult("❌ Error", "No cities returned from API", false);
        return;
      }

      // Step 3: Get Servers for first city
      const firstCity = cities[0];
      console.log("🧪 Step 3: Getting servers for city:", firstCity);
      const servers = await getServers(firstCity.id, deviceToken);
      addResult("✅ Servers", { city: firstCity, servers }, true);

      if (!servers || servers.length === 0) {
        addResult("❌ Error", "No servers returned from API", false);
        return;
      }

      // Step 4: Create credentials for first server
      const firstServer = servers[0];
      console.log("🧪 Step 4: Creating credentials for server:", firstServer);
      const credentials = await createCredentials(firstServer.id, deviceToken);
      addResult("✅ Credentials", { server: firstServer, credentials }, true);

      // Step 5: Build WireGuard config
      if (credentials && credentials.config) {
        const config = buildWireGuardConfig(credentials.config);
        addResult("✅ WireGuard Config", config, true);
      } else {
        addResult("❌ Error", "No config data in credentials response", false);
      }

      addResult(
        "🎉 Complete",
        "Full server selection flow completed successfully!",
        true
      );
    } catch (error) {
      console.error("🧪 Test failed:", error);
      addResult("❌ Error", error, false);
    } finally {
      setTesting(false);
    }
  };

  const buildWireGuardConfig = (config: any): string => {
    console.log("config", config);
    try {
      console.log("🔧 Full API response:", JSON.stringify(config, null, 2));

      // Handle the actual API response structure
      let interfaceConfig, peerConfig;

      // The API returns: { config: { Interface: {...}, Peer: {...} } }
      if (config.config && config.config.Interface && config.config.Peer) {
        interfaceConfig = config.config.Interface;
        peerConfig = config.config.Peer;
        console.log(
          "🔧 Using structured config.config.Interface and config.config.Peer"
        );
      }
      // Fallback: try to find config in credentials.data
      else if (config.credentials && config.credentials.data) {
        const credData = config.credentials.data;
        // Try to build from flat structure
        interfaceConfig = {
          PrivateKey: credData.private_key,
          Address: "10.8.0.3/32", // Default, could be dynamic
          DNS: "1.1.1.1",
        };
        // Would need server info for peer config - this is a fallback
        console.log("🔧 Using fallback from credentials.data");
      }
      // Another fallback: look for direct Interface/Peer structure
      else if (config.Interface && config.Peer) {
        interfaceConfig = config.Interface;
        peerConfig = config.Peer;
        console.log("🔧 Using direct Interface and Peer");
      } else {
        throw new Error(
          "Could not find Interface and Peer config in API response"
        );
      }

      console.log("🔧 Interface config:", interfaceConfig);
      console.log("🔧 Peer config:", peerConfig);

      // Extract values from the structured config
      const privateKey =
        interfaceConfig.PrivateKey ||
        interfaceConfig.privateKey ||
        "MISSING_PRIVATE_KEY";
      const address =
        interfaceConfig.Address || interfaceConfig.address || "10.8.0.3/32";
      const dns = interfaceConfig.DNS || interfaceConfig.dns || "1.1.1.1";

      const publicKey =
        peerConfig.PublicKey || peerConfig.publicKey || "MISSING_PUBLIC_KEY";
      const endpoint =
        peerConfig.Endpoint || peerConfig.endpoint || "MISSING_ENDPOINT";
      const allowedIPs =
        peerConfig.AllowedIPs || peerConfig.allowedIPs || "0.0.0.0/0";
      const persistentKeepalive =
        peerConfig.PersistentKeepalive || peerConfig.persistentKeepalive || 25;

      // Log extracted values for debugging
      console.log("🔧 Extracted values:", {
        privateKey: privateKey.substring(0, 10) + "...",
        address,
        dns,
        publicKey: publicKey.substring(0, 10) + "...",
        endpoint,
        allowedIPs,
        persistentKeepalive,
      });

      const wireGuardConfig = `[Interface]
PrivateKey = ${privateKey}
Address = ${address}
DNS = ${dns}

[Peer]
PublicKey = ${publicKey}
Endpoint = ${endpoint}
AllowedIPs = ${allowedIPs}
PersistentKeepalive = ${persistentKeepalive}`;

      console.log("✅ Generated WireGuard config successfully");

      // Validate that we have the essential fields
      const missingFields = [];
      if (privateKey.includes("MISSING")) missingFields.push("privateKey");
      if (publicKey.includes("MISSING")) missingFields.push("publicKey");
      if (endpoint.includes("MISSING")) missingFields.push("endpoint");

      if (missingFields.length > 0) {
        console.warn("⚠️ Missing critical fields:", missingFields);
        throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
      }

      return wireGuardConfig;
    } catch (error) {
      console.error("❌ Error building WireGuard config:", error);
      console.error("❌ Raw config data:", JSON.stringify(config, null, 2));
      throw new Error(`Failed to build WireGuard config: ${error}`);
    }
  };

  const testCountriesOnly = async () => {
    if (!deviceToken) {
      Alert.alert("Error", "No device token available");
      return;
    }

    setTesting(true);
    setResults([]);

    try {
      addResult("🔄 Testing", "Testing countries API only", true);
      const countries = await getCountries(deviceToken);
      addResult("✅ Countries Response", countries, true);

      if (countries && countries.length > 0) {
        addResult(
          "📊 Countries Count",
          `Found ${countries.length} countries`,
          true
        );
        addResult("🔍 First Country", countries[0], true);
      }
    } catch (error) {
      addResult("❌ Error", error, false);
    } finally {
      setTesting(false);
    }
  };

  const testCredentialsCreation = async () => {
    if (!deviceToken) {
      Alert.alert("Error", "No device token available");
      return;
    }

    setTesting(true);
    setResults([]);

    try {
      addResult("🔄 Testing", "Testing credentials creation flow", true);

      // First get countries
      const countries = await getCountries(deviceToken);
      if (!countries || countries.length === 0) {
        addResult("❌ Error", "No countries available for testing", false);
        return;
      }

      // Get first country
      const country = countries[0];
      addResult("🔍 Country Selected", country, true);

      // Get cities for country
      const cities = await getCities(country.id, deviceToken);
      if (!cities || cities.length === 0) {
        addResult("❌ Error", "No cities available for testing", false);
        return;
      }

      // Get first city
      const city = cities[0];
      addResult("🔍 City Selected", city, true);

      // Get servers for city
      const servers = await getServers(city.id, deviceToken);
      if (!servers || servers.length === 0) {
        addResult("❌ Error", "No servers available for testing", false);
        return;
      }

      // Get first server
      const server = servers[0];
      addResult("🔍 Server Selected", server, true);

      // Now test credentials creation with detailed logging
      addResult(
        "🔄 Testing Credentials",
        `Attempting to create credentials for server ${server.id}`,
        true
      );

      try {
        const credentials = await createCredentials(server.id, deviceToken);
        addResult("✅ Credentials Success", credentials, true);

        // Test config building
        try {
          const config = buildWireGuardConfig(credentials);
          addResult("✅ Config Generated", config, true);
        } catch (configError) {
          addResult("❌ Config Error", configError, false);
        }
      } catch (credError: any) {
        addResult("❌ Credentials Failed", credError, false);

        // Add detailed error analysis
        if (credError.response) {
          addResult(
            "📊 Error Response",
            {
              status: credError.response.status,
              statusText: credError.response.statusText,
              data: credError.response.data,
              headers: credError.response.headers,
            },
            false
          );
        }

        if (credError.config) {
          addResult(
            "📊 Request Config",
            {
              url: credError.config.url,
              method: credError.config.method,
              params: credError.config.params,
              headers: credError.config.headers,
            },
            false
          );
        }
      }
    } catch (error) {
      addResult("❌ General Error", error, false);
    } finally {
      setTesting(false);
    }
  };

  const testDeviceTokenValidity = async () => {
    if (!deviceToken) {
      Alert.alert("Error", "No device token available");
      return;
    }

    setTesting(true);
    setResults([]);

    try {
      addResult("🔄 Testing", "Testing device token validity", true);
      addResult("📋 Device Token", deviceToken, true);

      // Test if device token works by calling countries API
      const countries = await getCountries(deviceToken);

      if (countries && countries.length > 0) {
        addResult(
          "✅ Token Valid",
          `Device token works - found ${countries.length} countries`,
          true
        );
        addResult("📊 Sample Country", countries[0], true);
      } else {
        addResult(
          "⚠️ Token Issue",
          "Device token might be invalid - no countries returned",
          false
        );
      }
    } catch (error) {
      addResult(
        "❌ Token Invalid",
        "Device token appears to be invalid or expired",
        false
      );
      addResult("📊 Error Details", error, false);
    } finally {
      setTesting(false);
    }
  };

  const testWireGuardConfigConversion = async () => {
    if (!deviceToken) {
      Alert.alert("Error", "No device token available");
      return;
    }

    setTesting(true);
    setResults([]);

    try {
      addResult("🔄 Testing", "Testing WireGuard config conversion", true);

      // Get a server to test with
      const countries = await getCountries(deviceToken);
      if (!countries || countries.length === 0) {
        addResult("❌ Error", "No countries available", false);
        return;
      }

      const country = countries[0];
      const cities = await getCities(country.id, deviceToken);
      if (!cities || cities.length === 0) {
        addResult("❌ Error", "No cities available", false);
        return;
      }

      const city = cities[0];
      const servers = await getServers(city.id, deviceToken);
      if (!servers || servers.length === 0) {
        addResult("❌ Error", "No servers available", false);
        return;
      }

      const server = servers[0];
      addResult(
        "🔍 Testing Server",
        {
          server: server.name || server.server_name || server.id,
          country: country.name || country.country_name,
          city: city.name || city.city_name,
        },
        true
      );

      // Get credentials
      const credentials = await createCredentials(server.id, deviceToken);
      addResult("✅ Raw Credentials Response", credentials, true);

      // Test different ways to extract the config data
      let configData = null;

      // Try different possible structures
      if (credentials.config) {
        configData = credentials.config;
        addResult("📊 Config found at: credentials.config", configData, true);
      } else if (credentials.data && credentials.data.config) {
        configData = credentials.data.config;
        addResult(
          "📊 Config found at: credentials.data.config",
          configData,
          true
        );
      } else if (credentials.data) {
        configData = credentials.data;
        addResult("📊 Config found at: credentials.data", configData, true);
      } else {
        configData = credentials;
        addResult("📊 Using entire response as config", configData, true);
      }

      // Test the current buildWireGuardConfig function
      try {
        const wireGuardConfig = buildWireGuardConfig(credentials);
        addResult("✅ Generated WireGuard Config", wireGuardConfig, true);

        // Validate the config has required fields
        const hasPrivateKey =
          wireGuardConfig.includes("PrivateKey =") &&
          !wireGuardConfig.includes("MISSING_PRIVATE_KEY");
        const hasPublicKey =
          wireGuardConfig.includes("PublicKey =") &&
          !wireGuardConfig.includes("MISSING_PUBLIC_KEY");
        const hasEndpoint =
          wireGuardConfig.includes("Endpoint =") &&
          !wireGuardConfig.includes("MISSING_ENDPOINT");

        addResult(
          "🔍 Config Validation",
          {
            hasPrivateKey,
            hasPublicKey,
            hasEndpoint,
            isValid: hasPrivateKey && hasPublicKey && hasEndpoint,
          },
          hasPrivateKey && hasPublicKey && hasEndpoint
        );

        if (!hasPrivateKey || !hasPublicKey || !hasEndpoint) {
          addResult(
            "⚠️ Missing Fields",
            "Some required fields are missing. Raw config data:",
            true
          );
          addResult("🔧 Raw Config Data", configData, true);
        }
      } catch (configError) {
        addResult("❌ Config Conversion Failed", configError, false);
        addResult("🔧 Raw Config Data for Debug", configData, false);
      }
    } catch (error) {
      addResult("❌ Test Failed", error, false);
    } finally {
      setTesting(false);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>VPN Server API Tester</Text>

      <Text style={styles.subtitle}>
        Device Token: {deviceToken ? "✅ Available" : "❌ Missing"}
      </Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, testing && styles.buttonDisabled]}
          onPress={testCompleteFlow}
          disabled={testing}
        >
          <Text style={styles.buttonText}>
            {testing ? "Testing..." : "Test Complete Flow"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            styles.secondaryButton,
            testing && styles.buttonDisabled,
          ]}
          onPress={testCountriesOnly}
          disabled={testing}
        >
          <Text style={styles.buttonText}>
            {testing ? "Testing..." : "Test Countries Only"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            styles.warningButton,
            testing && styles.buttonDisabled,
          ]}
          onPress={testCredentialsCreation}
          disabled={testing}
        >
          <Text style={styles.buttonText}>
            {testing ? "Testing..." : "Test Credentials Creation"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            styles.infoButton,
            testing && styles.buttonDisabled,
          ]}
          onPress={testDeviceTokenValidity}
          disabled={testing}
        >
          <Text style={styles.buttonText}>
            {testing ? "Testing..." : "Test Device Token"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            styles.warningButton,
            testing && styles.buttonDisabled,
          ]}
          onPress={testWireGuardConfigConversion}
          disabled={testing}
        >
          <Text style={styles.buttonText}>
            {testing ? "Testing..." : "Test WireGuard Config Conversion"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.clearButton]}
          onPress={clearResults}
        >
          <Text style={styles.buttonText}>Clear Results</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.resultsContainer}>
        {results.map((result, index) => (
          <View
            key={index}
            style={[
              styles.resultItem,
              result.type === "error" && styles.errorItem,
            ]}
          >
            <Text style={styles.resultTimestamp}>{result.timestamp}</Text>
            <Text style={styles.resultStep}>{result.step}</Text>
            <Text style={styles.resultData}>
              {typeof result.data === "string"
                ? result.data
                : JSON.stringify(result.data, null, 2)}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#0A0F1C",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#CCCCCC",
    marginBottom: 20,
    textAlign: "center",
  },
  buttonContainer: {
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  secondaryButton: {
    backgroundColor: "#00FFAA",
  },
  warningButton: {
    backgroundColor: "#FF9500",
  },
  infoButton: {
    backgroundColor: "#5856D6",
  },
  clearButton: {
    backgroundColor: "#FF3B30",
  },
  buttonDisabled: {
    backgroundColor: "#666666",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: "#1A1D2A",
    borderRadius: 10,
    padding: 10,
  },
  resultItem: {
    backgroundColor: "#2A2D3A",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: "#00FFAA",
  },
  errorItem: {
    borderLeftColor: "#FF3B30",
  },
  resultTimestamp: {
    fontSize: 12,
    color: "#888888",
    marginBottom: 5,
  },
  resultStep: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 5,
  },
  resultData: {
    fontSize: 12,
    color: "#CCCCCC",
    fontFamily: "monospace",
  },
});
