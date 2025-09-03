import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import {
  getCountries,
  getCities,
  getServers,
  createCredentials,
} from "@/service/vpnService";

interface Country {
  id: string;
  name?: string;
  country_name?: string;
  code?: string;
  flag?: string;
  [key: string]: any;
}

interface City {
  id: string;
  name?: string;
  city_name?: string;
  country_id?: string;
  [key: string]: any;
}

interface Server {
  id: string;
  name?: string;
  server_name?: string;
  city_id?: string;
  load?: number;
  server_load?: number;
  status?: string;
  server_status?: string;
  [key: string]: any;
}

interface ServerSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onServerSelect: (
    config: string,
    serverInfo: { country: string; city: string; server: string }
  ) => void;
}

export const ServerSelectionModal: React.FC<ServerSelectionModalProps> = ({
  visible,
  onClose,
  onServerSelect,
}) => {
  const [step, setStep] = useState<"country" | "city" | "server">("country");
  const [loading, setLoading] = useState(false);
  const deviceToken = ""

  const [countries, setCountries] = useState<Country[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [servers, setServers] = useState<Server[]>([]);

  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [selectedServer, setSelectedServer] = useState<Server | null>(null);

  const resetSelection = () => {
    setStep("country");
    setSelectedCountry(null);
    setSelectedCity(null);
    setSelectedServer(null);
    setCities([]);
    setServers([]);
  };

  const loadCountries = async () => {
    if (!deviceToken) return;

    setLoading(true);
    try {
      console.log("🔄 Loading countries...");
      const response = await getCountries(deviceToken);
      console.log(
        "✅ Countries response received:",
        JSON.stringify(response, null, 2)
      );

      // Handle different possible response structures
      let countriesData = response;
      if (response && typeof response === "object") {
        if (response.data && Array.isArray(response.data)) {
          countriesData = response.data;
        } else if (response.countries && Array.isArray(response.countries)) {
          countriesData = response.countries;
        } else if (Array.isArray(response)) {
          countriesData = response;
        }
      }

      console.log(
        "📊 Processing countries data:",
        JSON.stringify(countriesData, null, 2)
      );

      if (
        !countriesData ||
        !Array.isArray(countriesData) ||
        countriesData.length === 0
      ) {
        throw new Error("No countries data available or invalid format");
      }

      setCountries(countriesData);
    } catch (error) {
      console.error("❌ Failed to load countries:", error);
      Alert.alert("Error", "Failed to load countries. Please try again.");
      setCountries([]); // Set empty array as fallback
    } finally {
      setLoading(false);
    }
  };

  const loadCities = async (countryId: string) => {
    if (!deviceToken) return;

    setLoading(true);
    try {
      console.log("🔄 Loading cities for country:", countryId);
      const response = await getCities(countryId, deviceToken);
      console.log(
        "✅ Cities response received:",
        JSON.stringify(response, null, 2)
      );

      // Handle different possible response structures
      let citiesData = response;
      if (response && typeof response === "object") {
        if (response.data && Array.isArray(response.data)) {
          citiesData = response.data;
        } else if (response.cities && Array.isArray(response.cities)) {
          citiesData = response.cities;
        } else if (Array.isArray(response)) {
          citiesData = response;
        }
      }

      console.log(
        "📊 Processing cities data:",
        JSON.stringify(citiesData, null, 2)
      );

      if (
        !citiesData ||
        !Array.isArray(citiesData) ||
        citiesData.length === 0
      ) {
        throw new Error("No cities data available or invalid format");
      }

      setCities(citiesData);
      setStep("city");
    } catch (error) {
      console.error("❌ Failed to load cities:", error);
      Alert.alert("Error", "Failed to load cities. Please try again.");
      setCities([]); // Set empty array as fallback
    } finally {
      setLoading(false);
    }
  };

  const loadServers = async (cityId: string) => {
    if (!deviceToken) return;

    setLoading(true);
    try {
      console.log("🔄 Loading servers for city:", cityId);
      const response = await getServers(cityId, deviceToken);
      console.log(
        "✅ Servers response received:",
        JSON.stringify(response, null, 2)
      );

      // Handle different possible response structures
      let serversData = response;
      if (response && typeof response === "object") {
        if (response.data && Array.isArray(response.data)) {
          serversData = response.data;
        } else if (response.servers && Array.isArray(response.servers)) {
          serversData = response.servers;
        } else if (Array.isArray(response)) {
          serversData = response;
        }
      }

      console.log(
        "📊 Processing servers data:",
        JSON.stringify(serversData, null, 2)
      );

      if (
        !serversData ||
        !Array.isArray(serversData) ||
        serversData.length === 0
      ) {
        throw new Error("No servers data available or invalid format");
      }

      setServers(serversData);
      setStep("server");
    } catch (error) {
      console.error("❌ Failed to load servers:", error);
      Alert.alert("Error", "Failed to load servers. Please try again.");
      setServers([]); // Set empty array as fallback
    } finally {
      setLoading(false);
    }
  };

  const selectServer = async (server: Server) => {
    if (!deviceToken) {
      Alert.alert("Error", "No device token available");
      return;
    }

    setLoading(true);
    try {
      console.log("🔄 Creating credentials for server:", {
        serverId: server.id,
        serverName: server.name || server.server_name,
        deviceToken: deviceToken,
        selectedCountry: selectedCountry?.name,
        selectedCity: selectedCity?.name,
      });

      const credentials = await createCredentials(server.id, deviceToken);
      console.log(
        "✅ Credentials created successfully:",
        JSON.stringify(credentials, null, 2)
      );

      // Build WireGuard config string from credentials
      const config = buildWireGuardConfig(credentials);

      const serverInfo = {
        country:
          selectedCountry?.name || selectedCountry?.country_name || "Unknown",
        city: selectedCity?.name || selectedCity?.city_name || "Unknown",
        server: server.name || server.server_name || `Server ${server.id}`,
      };

      console.log("✅ Server selection complete:", serverInfo);
      onServerSelect(config, serverInfo);
      onClose();
    } catch (error: any) {
      console.error("❌ Failed to create credentials:", error);

      // Extract more specific error message
      let errorMessage =
        "Failed to create server credentials. Please try again.";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      Alert.alert("Server Connection Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const buildWireGuardConfig = (config: any): string => {
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

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    loadCities(country.id);
  };

  const handleCitySelect = (city: City) => {
    setSelectedCity(city);
    loadServers(city.id);
  };

  const handleBack = () => {
    if (step === "city") {
      setStep("country");
      setCities([]);
    } else if (step === "server") {
      setStep("city");
      setServers([]);
    }
  };

  useEffect(() => {
    if (visible && deviceToken) {
      loadCountries();
    }
  }, [visible, deviceToken]);

  useEffect(() => {
    if (!visible) {
      resetSelection();
    }
  }, [visible]);

  const renderCountries = () => {
    if (!countries || !Array.isArray(countries)) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No countries available</Text>
        </View>
      );
    }

    return (
      <ScrollView style={styles.list}>
        {countries.map((country) => (
          <TouchableOpacity
            key={country.id}
            style={styles.listItem}
            onPress={() => handleCountrySelect(country)}
          >
            <Text style={styles.listItemText}>
              {country.flag || "🌍"}{" "}
              {country.name || country.country_name || "Unknown Country"}
            </Text>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  const renderCities = () => {
    if (!cities || !Array.isArray(cities)) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No cities available</Text>
        </View>
      );
    }

    return (
      <ScrollView style={styles.list}>
        {cities.map((city) => (
          <TouchableOpacity
            key={city.id}
            style={styles.listItem}
            onPress={() => handleCitySelect(city)}
          >
            <Text style={styles.listItemText}>
              {city.name || city.city_name || "Unknown City"}
            </Text>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  const renderServers = () => {
    if (!servers || !Array.isArray(servers)) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No servers available</Text>
        </View>
      );
    }

    return (
      <ScrollView style={styles.list}>
        {servers.map((server) => (
          <TouchableOpacity
            key={server.id}
            style={styles.listItem}
            onPress={() => selectServer(server)}
          >
            <View style={styles.serverInfo}>
              <Text style={styles.listItemText}>
                {server.name || server.server_name || `Server ${server.id}`}
              </Text>
              <Text style={styles.serverLoad}>
                Load: {server.load || server.server_load || "N/A"}%
              </Text>
              <Text style={styles.serverStatus}>
                Status: {server.status || server.server_status || "Unknown"}
              </Text>
            </View>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  const getTitle = () => {
    switch (step) {
      case "country":
        return "Select Country";
      case "city":
        return `Select City in ${selectedCountry?.name}`;
      case "server":
        return `Select Server in ${selectedCity?.name}`;
      default:
        return "Select Server";
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={step === "country" ? onClose : handleBack}>
            <Text style={styles.headerButton}>
              {step === "country" ? "Cancel" : "Back"}
            </Text>
          </TouchableOpacity>
          <Text style={styles.title}>{getTitle()}</Text>
          <View style={styles.headerSpacer} />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00FFAA" />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        ) : (
          <>
            {step === "country" && renderCountries()}
            {step === "city" && renderCities()}
            {step === "server" && renderServers()}
          </>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0F1C",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#2A2D3A",
  },
  headerButton: {
    color: "#00FFAA",
    fontSize: 16,
    fontWeight: "600",
  },
  headerSpacer: {
    width: 60,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  list: {
    flex: 1,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1A1D2A",
  },
  listItemText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  serverInfo: {
    flex: 1,
  },
  serverLoad: {
    color: "#888",
    fontSize: 12,
    marginTop: 4,
  },
  serverStatus: {
    color: "#888",
    fontSize: 12,
    marginTop: 4,
  },
  arrow: {
    color: "#00FFAA",
    fontSize: 18,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#FFFFFF",
    fontSize: 16,
    marginTop: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
});
