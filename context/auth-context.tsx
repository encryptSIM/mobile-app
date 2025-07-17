// context/auth-context.tsx
import React, { createContext, useContext, ReactNode } from "react";
import { useAsyncStorage } from "@/hooks/asyn-storage-hook";
import { useMobileWallet } from "@/hooks/use-mobile-wallet";
import type { Account, AuthorizedWallet } from "@/hooks/use-mobile-wallet";
import { PublicKey } from "@solana/web3.js";

interface AuthContextType {
  // Legacy public key support (for backwards compatibility)
  publicKey: string | null;
  loading: boolean;
  setValue: (value: string) => Promise<void>;

  // Device token (existing functionality)
  deviceToken: string | null;
  deviceTokenLoading: boolean;
  setDeviceToken: (value: string) => Promise<void>;

  // Mobile wallet adapter integration
  wallet: {
    connecting: boolean;
    connected: boolean;
    authorizedWallet: AuthorizedWallet | null;
    selectedAccount: Account | null;
    publicKey: PublicKey | null;
    connect: () => Promise<void>;
    disconnect: () => void;
    reauthorize: () => Promise<void>;
  };

  // Unified account info (prefers wallet, falls back to legacy)
  currentPublicKey: string | null;
  currentPublicKeyObject: PublicKey | null;
  isWalletConnected: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Legacy public key storage (backwards compatibility)
  const {
    value: publicKey,
    loading,
    setValue,
  } = useAsyncStorage<string>("publicKey");

  // Device token storage (existing functionality)
  const {
    value: deviceToken,
    loading: deviceTokenLoading,
    setValue: setDeviceToken,
  } = useAsyncStorage<string>("deviceToken");

  // Mobile wallet adapter
  const walletAdapter = useMobileWallet();

  // Unified account information
  const currentPublicKey = walletAdapter.connected
    ? walletAdapter.selectedAccount?.address || null
    : publicKey;

  const currentPublicKeyObject = walletAdapter.connected
    ? walletAdapter.publicKey
    : publicKey
    ? new PublicKey(publicKey)
    : null;

  const isWalletConnected = walletAdapter.connected;

  console.log("🔄 AuthProvider state:", {
    legacyPublicKey: publicKey,
    deviceToken,
    walletConnected: walletAdapter.connected,
    currentPublicKey,
    loading,
    deviceTokenLoading,
  });

  const contextValue: AuthContextType = {
    // Legacy support
    publicKey,
    loading,
    setValue,

    // Device token
    deviceToken,
    deviceTokenLoading,
    setDeviceToken,

    // Wallet adapter
    wallet: {
      connecting: walletAdapter.connecting,
      connected: walletAdapter.connected,
      authorizedWallet: walletAdapter.authorizedWallet,
      selectedAccount: walletAdapter.selectedAccount,
      publicKey: walletAdapter.publicKey,
      connect: walletAdapter.connect,
      disconnect: walletAdapter.disconnect,
      reauthorize: walletAdapter.reauthorize,
    },

    // Unified state
    currentPublicKey,
    currentPublicKeyObject,
    isWalletConnected,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
