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

export function isSolanaWalletExtensionAvailable(): boolean {
  return Object.values(detectWallets()).some(w => w)
}

export const detectWallets = () => {
  const wallets: Record<string, boolean> = {
    Phantom: !!(window as any).solana?.isPhantom,
    Solflare: !!(window as any).solflare?.isSolflare,
    Backpack: !!(window as any).backpack?.isBackpack,
  };
  return wallets;
};

export function isIOSWeb() {
  if (Platform.OS === "web") {
    const ua = navigator.userAgent || navigator.vendor

    // iOS detection (iPhone, iPad, iPod)
    const isIOS =
      /iPad|iPhone|iPod/.test(ua) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1); // iPadOS

    return isIOS;
  }
  return false;
}
