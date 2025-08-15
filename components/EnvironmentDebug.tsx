import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { detectEnvironment, shouldUseWebWalletAdapter, shouldUseMobileWalletAdapter } from '@/utils/environment';

interface EnvironmentDebugProps {
  show?: boolean;
}

export const EnvironmentDebug: React.FC<EnvironmentDebugProps> = ({ show = false }) => {
  if (!show) return null;

  const env = detectEnvironment();
  const useWeb = shouldUseWebWalletAdapter();
  const useMobile = shouldUseMobileWalletAdapter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Environment Debug</Text>
      <Text style={styles.text}>Platform: {env.platform}</Text>
      <Text style={styles.text}>Is Web: {env.isWeb ? 'Yes' : 'No'}</Text>
      <Text style={styles.text}>Is Mobile: {env.isMobile ? 'Yes' : 'No'}</Text>
      <Text style={styles.text}>Is Wallet Browser: {env.isWalletBrowser ? 'Yes' : 'No'}</Text>
      <Text style={styles.text}>Is Native App: {env.isNativeApp ? 'Yes' : 'No'}</Text>
      <Text style={styles.text}>Use Web Adapter: {useWeb ? 'Yes' : 'No'}</Text>
      <Text style={styles.text}>Use Mobile Adapter: {useMobile ? 'Yes' : 'No'}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 10,
    borderRadius: 8,
    zIndex: 1000,
  },
  title: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  text: {
    color: 'white',
    fontSize: 12,
    marginBottom: 2,
  },
}); 
