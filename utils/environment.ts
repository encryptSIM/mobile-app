import { Platform } from 'react-native';

export interface EnvironmentInfo {
  isWeb: boolean;
  isMobile: boolean;
  isWalletBrowser: boolean;
  isNativeApp: boolean;
  platform: 'web' | 'ios' | 'android';
}

export function detectEnvironment(): EnvironmentInfo {
  const isWeb = Platform.OS === 'web';
  const isMobile = Platform.OS === 'ios' || Platform.OS === 'android';

  let isWalletBrowser = false;

  if (isWeb) {
    const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : '';
    const walletBrowsers = [
      'phantom',
      'solflare',
      'backpack',
      'glow',
      'trust',
      'mathwallet',
      'metamask',
      'brave',
      'coinbase',
      'exodus'
    ];

    isWalletBrowser = walletBrowsers.some(wallet =>
      userAgent.toLowerCase().includes(wallet.toLowerCase())
    );
  }

  const isNativeApp = isMobile && !isWeb;

  return {
    isWeb,
    isMobile,
    isWalletBrowser,
    isNativeApp,
    platform: Platform.OS as 'web' | 'ios' | 'android'
  };
}

export function shouldUseWebWalletAdapter(): boolean {
  const env = detectEnvironment();
  return env.isWeb || env.isWalletBrowser;
}

export function shouldUseMobileWalletAdapter(): boolean {
  const env = detectEnvironment();
  return env.isNativeApp && !env.isWalletBrowser;
} 
