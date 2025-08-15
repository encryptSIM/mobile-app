import React, { useState } from 'react';
import { TouchableOpacity, Text, View, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { shouldUseWebWalletAdapter } from '@/utils/environment';
import { addressFormatter } from '@/utils';

interface WebWalletConnectButtonProps {
  onConnected?: () => void;
  onDisconnected?: () => void;
  style?: any;
  fullWidth?: boolean;
  showAddress?: boolean;
}

export const WebWalletConnectButton: React.FC<WebWalletConnectButtonProps> = ({
  onConnected,
  onDisconnected,
  style,
  fullWidth = false,
  showAddress = true,
}) => {
  const { colors } = useTheme();
  const wallet = useWallet();
  const [connecting, setConnecting] = useState(false);

  // Only render this component if we should use web wallet adapter
  if (!shouldUseWebWalletAdapter()) {
    return null;
  }

  const handleConnect = async () => {
    if (connecting || wallet.connected) return;

    try {
      setConnecting(true);
      
      // For web wallets, we need to show the wallet selection modal
      // The WalletMultiButton will handle this automatically
      console.log('🔄 Initiating web wallet connection...');
      
      // The actual connection will be handled by the wallet selection modal
      // We just need to trigger it
      
    } catch (error: any) {
      console.error('Web wallet connection error:', error);
      Alert.alert('Connection Failed', error.message || 'Failed to connect wallet');
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = () => {
    Alert.alert(
      'Disconnect Wallet',
      'Are you sure you want to disconnect your wallet?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: () => {
            wallet.disconnect();
            onDisconnected?.();
            Alert.alert('Disconnected', 'Wallet has been disconnected');
          },
        },
      ]
    );
  };

  const isLoading = connecting || wallet.connecting;

  if (wallet.connected && wallet.publicKey) {
    return (
      <View style={[styles.container, fullWidth && styles.fullWidth, style]}>
        {showAddress && (
          <View style={styles.accountInfo}>
            <View style={styles.accountRow}>
              <Feather name="check-circle" size={16} color={colors.primary} />
              <Text style={[styles.connectedText, { color: colors.primary }]}>
                Connected
              </Text>
            </View>
            <Text style={[styles.addressText, { color: colors.text }]}>
              {addressFormatter(wallet.publicKey.toString())}
            </Text>
            {wallet.wallet?.adapter.name && (
              <Text style={[styles.labelText, { color: colors.text }]}>
                {wallet.wallet.adapter.name}
              </Text>
            )}
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.button,
            styles.disconnectButton,
            { borderColor: colors.primary },
          ]}
          onPress={handleDisconnect}
        >
          <Text style={[styles.buttonText, { color: colors.primary }]}>
            Disconnect
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // For web environments, render the Solana wallet adapter button
  return (
    <View style={[styles.webButtonContainer, fullWidth && styles.fullWidth, style]}>
      <WalletMultiButton 
        style={{
          backgroundColor: colors.primary,
          color: 'white',
          border: 'none',
          borderRadius: 8,
          padding: '12px 20px',
          fontSize: 16,
          fontWeight: '600',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          opacity: isLoading ? 0.7 : 1,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  webButtonContainer: {
    alignItems: 'center',
  },
  accountInfo: {
    alignItems: 'center',
    marginBottom: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  connectedText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  addressText: {
    fontSize: 12,
    fontFamily: 'monospace',
    marginTop: 2,
  },
  labelText: {
    fontSize: 11,
    opacity: 0.7,
    marginTop: 2,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 140,
  },
  disconnectButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
}); 