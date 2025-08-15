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
import { Connection, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { useUnifiedWallet } from "@/hooks/use-unified-wallet";

export const TransactionExample: React.FC = () => {
  const { colors } = useTheme();
  const { signTransaction, signAndSendTransaction, connected, selectedAccount } = useUnifiedWallet();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSignTransaction = async () => {
    if (!connected || !selectedAccount) {
      Alert.alert("Error", "Please connect your wallet first");
      return;
    }

    try {
      setIsProcessing(true);

      // Get the public key from the selected account
      const publicKey = 'publicKey' in selectedAccount && selectedAccount.publicKey 
        ? selectedAccount.publicKey 
        : new PublicKey(selectedAccount.address);

      // Create a simple transfer transaction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey("11111111111111111111111111111111"), // System program
          lamports: 1000, // 0.000001 SOL
        })
      );

      // Sign the transaction
      const signedTransaction = await signTransaction(transaction);
      console.log("Transaction signed:", signedTransaction);

      Alert.alert("Success", "Transaction signed successfully!");
    } catch (error: any) {
      console.error("Sign transaction error:", error);
      Alert.alert("Error", `Failed to sign transaction: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSignAndSendTransaction = async () => {
    if (!connected || !selectedAccount) {
      Alert.alert("Error", "Please connect your wallet first");
      return;
    }

    try {
      setIsProcessing(true);

      // Get the public key from the selected account
      const publicKey = 'publicKey' in selectedAccount && selectedAccount.publicKey 
        ? selectedAccount.publicKey 
        : new PublicKey(selectedAccount.address);

      // Create a simple transfer transaction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey("11111111111111111111111111111111"), // System program
          lamports: 1000, // 0.000001 SOL
        })
      );

      // Connect to Solana network
      const connection = new Connection("https://api.mainnet-beta.solana.com");

      // Sign and send the transaction
      const signature = await signAndSendTransaction(transaction, connection);
      console.log("Transaction sent:", signature);

      Alert.alert("Success", `Transaction sent successfully!\nSignature: ${signature}`);
    } catch (error: any) {
      console.error("Sign and send transaction error:", error);
      Alert.alert("Error", `Failed to send transaction: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!connected) {
    return (
      <View style={styles.container}>
        <Text style={[styles.text, { color: colors.text }]}>
          Please connect your wallet to test transactions
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>
        Transaction Examples
      </Text>
      
      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.primary }]}
        onPress={handleSignTransaction}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>Sign Transaction</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.primary }]}
        onPress={handleSignAndSendTransaction}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>Sign & Send Transaction</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    textAlign: "center",
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginVertical: 8,
    minWidth: 200,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
