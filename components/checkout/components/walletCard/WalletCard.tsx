import React from 'react';
import { View, Image, ActivityIndicator } from 'react-native';
import { Card, Text, Chip } from 'react-native-paper';
import { $styles } from './styles';
import { useWalletAuth } from '@/components/auth/wallet-auth-wrapper';
import { useGetBalance } from '@/components/auth/account-data-access';
import { useConnection } from '@/components/auth/ConnectionProvider';
import { lamportsToSol } from '@/utils/lamports-to-sol';

interface WalletCardProps {
  disabled?: boolean;
  paymentAmount: number;
  estimatedBalance: number;
}

export const WalletCard: React.FC<WalletCardProps> = ({
  disabled = false,
  paymentAmount,
  estimatedBalance,
}) => {
  const { account, isConnected } = useWalletAuth();
  const { connection } = useConnection();
  const balanceQuery = useGetBalance({
    address: account?.publicKey!,
  });

  if (!isConnected || !account) {
    return (
      <Card style={$styles.card}>
        <Card.Content style={$styles.content}>
          <View style={$styles.header}>
            <View style={[$styles.titleContainer]}>
              <Image
                source={require('@/assets/solana.png')}
                style={$styles.methodIcon}
              />
              <Text style={$styles.title}>Wallet not connected</Text>
            </View>
          </View>
          <Text style={$styles.description}>
            Please connect your Solana wallet to continue with payment.
          </Text>
        </Card.Content>
      </Card>
    );
  }

  const balance = balanceQuery.data ? lamportsToSol(balanceQuery.data) : 0;
  const networkName = connection.rpcEndpoint.includes('devnet')
    ? 'Devnet'
    : connection.rpcEndpoint.includes('testnet')
      ? 'Testnet'
      : 'Mainnet';

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <Card style={$styles.card}>
      <Card.Content style={$styles.content}>
        <View style={$styles.header}>
          <View style={$styles.titleContainer}>
            <Image
              source={require('@/assets/solana.png')}
              style={$styles.methodIcon}
            />
            <Text style={$styles.title}>Connected Wallet</Text>
          </View>
          <Chip
            mode="outlined"
            compact
            style={$styles.networkChip}
            textStyle={$styles.networkText}
          >
            {networkName}
          </Chip>
        </View>

        <View style={$styles.walletDetails}>
          <View style={$styles.walletRow}>
            <Text style={$styles.walletLabel}>Address:</Text>
            <Text style={$styles.walletValue}>
              {formatAddress(account.address)}
            </Text>
          </View>

          <View style={$styles.walletRow}>
            <Text style={$styles.walletLabel}>Balance before:</Text>
            <View style={$styles.balanceContainer}>
              {balanceQuery.isLoading ? (
                <ActivityIndicator size="small" />
              ) : (
                <Text style={$styles.walletValue}>
                  {balance.toFixed(4)} SOL
                </Text>
              )}
            </View>
          </View>

          <View style={$styles.walletRow}>
            <Text style={$styles.walletLabel}>Amount you’ll pay:</Text>
            <Text style={$styles.valueNegative}>
              {paymentAmount.toFixed(4)} SOL
            </Text>
          </View>

          <View style={$styles.walletRow}>
            <Text style={$styles.walletLabel}>Balance after:</Text>
            <Text style={$styles.valuePositive}>
              {estimatedBalance.toFixed(4)} SOL
            </Text>
          </View>
        </View>

        <Text style={$styles.description}>
          After payment, you’ll still have {estimatedBalance.toFixed(4)} SOL
          remaining.
        </Text>
      </Card.Content>
    </Card>
  );
};
