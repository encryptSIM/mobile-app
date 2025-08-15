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
      'phantom', 'solflare', 'backpack', 'glow', 'trust', 'mathwallet', 'metamask', 'brave', 'coinbase', 'exodus'
    ];
    isWalletBrowser = walletBrowsers.some(wallet =>
      userAgent.toLowerCase().includes(wallet.toLowerCase())
    );
  }
  const isNativeApp = isMobile && !isWeb;
  return {
    isWeb, isMobile, isWalletBrowser, isNativeApp, platform: Platform.OS as 'web' | 'ios' | 'android'
  };
}

export function shouldUseWebWalletAdapter(): boolean {
  const env = detectEnvironment();
  // Use web wallet adapter if we're on web OR if we're in a wallet browser
  return env.isWeb || env.isWalletBrowser;
}

export function shouldUseMobileWalletAdapter(): boolean {
  const env = detectEnvironment();
  // Use mobile wallet adapter only for native apps that are not wallet browsers
  return env.isNativeApp && !env.isWalletBrowser;
}

// Helper function to check if a Solana wallet extension is available
export function isSolanaWalletExtensionAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  return !!(window as any).solana || !!(window as any).phantom;
} 
