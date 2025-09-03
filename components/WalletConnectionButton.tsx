import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useWalletAuth } from './auth/wallet-auth-provider';

interface WalletButtonProps {
  style?: any;
}

export function WalletButton({ style }: WalletButtonProps) {
  const { isConnected, isLoading, account, connect, disconnect } = useWalletAuth();

  const handlePress = async () => {
    if (isConnected) {
      // Show disconnect confirmation
      Alert.alert(
        'Disconnect Wallet',
        'Are you sure you want to disconnect your wallet?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Disconnect', style: 'destructive', onPress: disconnect }
        ]
      );
    } else {
      try {
        await connect();
      } catch (error: any) {
        Alert.alert('Connection Failed', error.message);
      }
    }
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: isConnected ? '#374151' : '#00D4AA' },
        style
      ]}
      onPress={handlePress}
      disabled={isLoading}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <Text style={[styles.text, { color: isConnected ? '#fff' : '#000' }]}>
          {isConnected ? truncateAddress(account!.address) : 'Connect Wallet'}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
  },
});
