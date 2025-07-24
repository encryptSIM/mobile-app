import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  clusterApiUrl,
} from "@solana/web3.js";
import { Feather } from "@expo/vector-icons";
import { useAuth } from "@/context/auth-context";
import { useMobileWallet } from "@/hooks/use-mobile-wallet";

interface TransactionExampleProps {
  onClose?: () => void;
}

export const TransactionExample: React.FC<TransactionExampleProps> = ({
  onClose,
}) => {
  const { colors } = useTheme();
  const { isWalletConnected, currentPublicKeyObject } = useAuth();
  const { signTransaction, signAndSendTransaction } = useMobileWallet();
  const [processing, setProcessing] = useState(false);

  const connection = new Connection(
    process.env.EXPO_PUBLIC_RPC_URL || clusterApiUrl("mainnet-beta"),
    {
      commitment: "confirmed",
      confirmTransactionInitialTimeout: 60000,
    }
  );

  const handleTestTransaction = async () => {
    if (!isWalletConnected || !currentPublicKeyObject) {
      Alert.alert("Error", "Please connect your wallet first");
      return;
    }

    try {
      setProcessing(true);

      // Create a test transaction (transfer 0.001 SOL to yourself)
      const testAmount = 0.001 * LAMPORTS_PER_SOL; // 0.001 SOL

      Alert.alert(
        "Test Transaction",
        `This will create a test transaction sending ${
          testAmount / LAMPORTS_PER_SOL
        } SOL to yourself. Continue?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Continue",
            onPress: async () => {
              try {
                console.log("🔄 Creating test transaction...");

                // Get recent blockhash
                const { blockhash } = await connection.getLatestBlockhash();

                // Create transaction
                const transaction = new Transaction({
                  feePayer: currentPublicKeyObject,
                  recentBlockhash: blockhash,
                });

                // Add instruction (send to self)
                transaction.add(
                  SystemProgram.transfer({
                    fromPubkey: currentPublicKeyObject,
                    toPubkey: currentPublicKeyObject, // Send to self
                    lamports: testAmount,
                  })
                );

                console.log("✅ Transaction created, requesting signature...");

                // Sign the transaction using mobile wallet adapter
                const signedTransaction = await signTransaction(transaction);
                console.log("✅ Transaction signed");

                // Send the signed transaction
                const signature = await connection.sendRawTransaction(
                  signedTransaction.serialize()
                );
                console.log("✅ Transaction sent:", signature);

                // Wait for confirmation
                console.log("🔄 Waiting for confirmation...");
                const confirmation = await connection.confirmTransaction(
                  signature,
                  "confirmed"
                );

                if (confirmation.value.err) {
                  throw new Error(
                    `Transaction failed: ${confirmation.value.err}`
                  );
                }

                console.log("✅ Transaction confirmed");

                Alert.alert(
                  "Success!",
                  `Transaction confirmed!\n\nSignature: ${signature.slice(
                    0,
                    8
                  )}...${signature.slice(-8)}`,
                  [{ text: "OK" }]
                );
              } catch (error: any) {
                console.error("❌ Transaction failed:", error);
                Alert.alert(
                  "Transaction Failed",
                  error.message || "An unexpected error occurred"
                );
              }
            },
          },
        ]
      );
    } catch (error: any) {
      console.error("❌ Test transaction setup failed:", error);
      Alert.alert("Error", error.message || "Failed to prepare transaction");
    } finally {
      setProcessing(false);
    }
  };

  const handleSignAndSendExample = async () => {
    if (!isWalletConnected || !currentPublicKeyObject) {
      Alert.alert("Error", "Please connect your wallet first");
      return;
    }

    try {
      setProcessing(true);

      Alert.alert(
        "Sign & Send Example",
        "This will use the signAndSendTransaction method to create, sign, and send a transaction in one step.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Continue",
            onPress: async () => {
              try {
                console.log("🔄 Creating sign & send transaction...");

                // Get recent blockhash
                const { blockhash } = await connection.getLatestBlockhash();

                // Create transaction
                const transaction = new Transaction({
                  feePayer: currentPublicKeyObject,
                  recentBlockhash: blockhash,
                });

                // Add instruction (send small amount to self)
                transaction.add(
                  SystemProgram.transfer({
                    fromPubkey: currentPublicKeyObject,
                    toPubkey: currentPublicKeyObject,
                    lamports: 1000, // Minimal amount
                  })
                );

                console.log("✅ Transaction created, signing and sending...");

                // Sign and send in one step
                const signature = await signAndSendTransaction(
                  transaction,
                  connection
                );
                console.log("✅ Transaction signed and confirmed:", signature);

                Alert.alert(
                  "Success!",
                  `Transaction signed and confirmed!\n\nSignature: ${signature.slice(
                    0,
                    8
                  )}...${signature.slice(-8)}`,
                  [{ text: "OK" }]
                );
              } catch (error: any) {
                console.error("❌ Sign & send failed:", error);
                Alert.alert(
                  "Transaction Failed",
                  error.message || "An unexpected error occurred"
                );
              }
            },
          },
        ]
      );
    } catch (error: any) {
      console.error("❌ Sign & send setup failed:", error);
      Alert.alert("Error", error.message || "Failed to prepare transaction");
    } finally {
      setProcessing(false);
    }
  };

  if (!isWalletConnected) {
    return (
      <View style={[styles.container, { backgroundColor: colors.card }]}>
        <Text style={[styles.title, { color: colors.text }]}>
          Transaction Examples
        </Text>
        <Text style={[styles.message, { color: colors.text }]}>
          Please connect your wallet to test transaction signing
        </Text>
        {onClose && (
          <TouchableOpacity
            style={[styles.closeButton, { borderColor: colors.border }]}
            onPress={onClose}
          >
            <Text style={[styles.closeButtonText, { color: colors.text }]}>
              Close
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Transaction Examples
        </Text>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.headerClose}>
            <Feather name="x" size={24} color={colors.text} />
          </TouchableOpacity>
        )}
      </View>

      <Text style={[styles.description, { color: colors.text }]}>
        Test the mobile wallet adapter transaction signing capabilities
      </Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.exampleButton,
            { backgroundColor: colors.primary },
            processing && styles.disabledButton,
          ]}
          onPress={handleTestTransaction}
          disabled={processing}
        >
          {processing ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Feather name="edit" size={18} color="white" />
          )}
          <Text style={styles.buttonText}>
            {processing ? "Processing..." : "Sign Transaction"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.exampleButton,
            { backgroundColor: colors.primary },
            processing && styles.disabledButton,
          ]}
          onPress={handleSignAndSendExample}
          disabled={processing}
        >
          {processing ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Feather name="send" size={18} color="white" />
          )}
          <Text style={styles.buttonText}>
            {processing ? "Processing..." : "Sign & Send"}
          </Text>
        </TouchableOpacity>
      </View>

      <View
        style={[styles.warningBox, { backgroundColor: colors.primary + "20" }]}
      >
        <Feather name="info" size={16} color={colors.primary} />
        <Text style={[styles.warningText, { color: colors.text }]}>
          These are test transactions that send small amounts to yourself.
          Network fees will apply.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 12,
    margin: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerClose: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
  },
  description: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 20,
    lineHeight: 20,
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    opacity: 0.7,
  },
  buttonContainer: {
    gap: 12,
    marginBottom: 20,
  },
  exampleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  closeButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  warningBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
  },
});
