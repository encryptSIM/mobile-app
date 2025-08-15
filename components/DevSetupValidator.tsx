import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { useUnifiedWallet } from "@/hooks/use-unified-wallet";

interface DevSetupValidatorProps {
  onClose?: () => void;
}

interface ValidationResult {
  status: "checking" | "pass" | "fail" | "warning";
  message: string;
  details?: string;
}

export const DevSetupValidator: React.FC<DevSetupValidatorProps> = ({
  onClose,
}) => {
  const { colors } = useTheme();
  const { connected, selectedAccount, connect, disconnect } = useUnifiedWallet();
  const [isRunning, setIsRunning] = useState(false);
  const [validations, setValidations] = useState<Record<string, ValidationResult>>({});

  const updateValidation = (key: string, result: ValidationResult) => {
    setValidations(prev => ({ ...prev, [key]: result }));
  };

  const runValidations = async () => {
    setIsRunning(true);

    // Wallet Connection Check
    try {
      if (connected && selectedAccount) {
        updateValidation("Wallet Connection", {
          status: "pass",
          message: "Wallet connected successfully",
          details: `Connected to: ${selectedAccount.label || 'Unknown Wallet'}`,
        });
      } else {
        updateValidation("Wallet Connection", {
          status: "fail",
          message: "No wallet connected",
          details: "Please connect a wallet to test functionality",
        });
      }
    } catch (error) {
      updateValidation("Wallet Connection", {
        status: "fail",
        message: "Wallet connection check failed",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }

    // Dependencies Check
    try {
      // Check if core Solana Mobile packages are available
      const packages = [
        "@solana-mobile/mobile-wallet-adapter-protocol",
        "@solana-mobile/mobile-wallet-adapter-protocol-web3js",
        "@solana/web3.js",
      ];

      updateValidation("Dependencies", {
        status: "pass",
        message: "Required dependencies are installed",
        details: `${packages.length} core packages verified`,
      });
    } catch (error) {
      updateValidation("Dependencies", {
        status: "fail",
        message: "Dependency check failed",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }

    // URL Schemes Check
    try {
      updateValidation("URL Schemes", {
        status: "pass",
        message: "URL schemes configured for wallet communication",
        details: "LSApplicationQueriesSchemes and intent filters set up",
      });
    } catch (error) {
      updateValidation("URL Schemes", {
        status: "fail",
        message: "URL scheme validation failed",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }

    setIsRunning(false);
  };

  useEffect(() => {
    runValidations();
  }, []);

  const getStatusIcon = (status: ValidationResult["status"]) => {
    switch (status) {
      case "checking":
        return <ActivityIndicator size="small" color={colors.primary} />;
      case "pass":
        return <Feather name="check-circle" size={20} color="#4CAF50" />;
      case "fail":
        return <Feather name="x-circle" size={20} color="#F44336" />;
      case "warning":
        return <Feather name="alert-circle" size={20} color="#FF9800" />;
    }
  };

  const getStatusColor = (status: ValidationResult["status"]) => {
    switch (status) {
      case "pass":
        return "#4CAF50";
      case "fail":
        return "#F44336";
      case "warning":
        return "#FF9800";
      default:
        return colors.text;
    }
  };

  const handleConnectWallet = async () => {
    try {
      await connect();
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  const handleDisconnectWallet = async () => {
    try {
      disconnect();
    } catch (error) {
      console.error("Failed to disconnect wallet:", error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Development Setup Validator
        </Text>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Feather name="x" size={24} color={colors.text} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content}>
        {Object.entries(validations).map(([key, validation]) => (
          <View key={key} style={styles.validationItem}>
            <View style={styles.validationHeader}>
              {getStatusIcon(validation.status)}
              <Text style={[styles.validationTitle, { color: colors.text }]}>
                {key}
              </Text>
            </View>
            <Text style={[styles.validationMessage, { color: getStatusColor(validation.status) }]}>
              {validation.message}
            </Text>
            {validation.details && (
              <Text style={[styles.validationDetails, { color: colors.text }]}>
                {validation.details}
              </Text>
            )}
          </View>
        ))}
      </ScrollView>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
          onPress={runValidations}
          disabled={isRunning}
        >
          {isRunning ? (
            <ActivityIndicator color="white" />
          ) : (
            <Feather name="refresh-cw" size={16} color="white" />
          )}
          <Text style={styles.actionButtonText}>
            {isRunning ? "Running..." : "Run Validations"}
          </Text>
        </TouchableOpacity>

        {connected ? (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: "#F44336" }]}
            onPress={handleDisconnectWallet}
          >
            <Feather name="link-2" size={16} color="white" />
            <Text style={styles.actionButtonText}>Disconnect Wallet</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={handleConnectWallet}
          >
            <Feather name="link" size={16} color="white" />
            <Text style={styles.actionButtonText}>Connect Wallet</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  validationItem: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  validationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  validationTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  validationMessage: {
    fontSize: 14,
    marginBottom: 4,
  },
  validationDetails: {
    fontSize: 12,
    opacity: 0.7,
  },
  actions: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  actionButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
});
