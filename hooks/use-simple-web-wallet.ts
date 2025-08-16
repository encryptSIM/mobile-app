import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Connection,
  PublicKey,
  Transaction,
  VersionedTransaction,
} from "@solana/web3.js";

export interface SimpleWebWalletAccount {
  address: string;
  label?: string;
  publicKey: PublicKey;
}

export interface SimpleWebAuthorizedWallet {
  accounts: SimpleWebWalletAccount[];
  selectedAccount: SimpleWebWalletAccount;
}

interface UseSimpleWebWalletReturn {
  connecting: boolean;
  connected: boolean;
  authorizedWallet: SimpleWebAuthorizedWallet | null;
  selectedAccount: SimpleWebWalletAccount | null;
  publicKey: PublicKey | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  reauthorize: () => Promise<void>;
  signTransaction: (
    transaction: Transaction | VersionedTransaction
  ) => Promise<Transaction | VersionedTransaction>;
  signAllTransactions: (
    transactions: (Transaction | VersionedTransaction)[]
  ) => Promise<(Transaction | VersionedTransaction)[]>;
  signAndSendTransaction: (
    transaction: Transaction | VersionedTransaction,
    connection: Connection
  ) => Promise<string>;
}

function isWalletBrowser(): boolean {
  if (typeof window === "undefined") return false;
  const userAgent = window.navigator.userAgent.toLowerCase();
  const walletBrowsers = [
    "phantom",
    "solflare",
    "backpack",
    "glow",
    "trust",
    "mathwallet",
    "metamask",
    "brave",
    "coinbase",
    "exodus",
  ];
  return walletBrowsers.some((wallet) => userAgent.includes(wallet));
}

function isSolanaWalletAvailable(): boolean {
  if (typeof window === "undefined") return false;
  return !!(window as any).solana || !!(window as any).phantom;
}

function getWalletProvider(): any {
  if (typeof window === "undefined") return null;
  return (window as any).solana;
}

export const useSimpleWebWallet = (): UseSimpleWebWalletReturn => {
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [authorizedWallet, setAuthorizedWallet] =
    useState<SimpleWebAuthorizedWallet | null>(null);
  const [publicKey, setPublicKey] = useState<PublicKey | null>(null);
  const [manuallyDisconnected, setManuallyDisconnected] = useState(false);

  const selectedAccount = useMemo(() => {
    return authorizedWallet?.selectedAccount || null;
  }, [authorizedWallet]);

  useEffect(() => {
    console.log("🔍 useSimpleWebWallet - state changed:", {
      connected,
      connecting,
      hasAuthorizedWallet: !!authorizedWallet,
      selectedAccount: selectedAccount?.address,
      publicKey: publicKey?.toString(),
    });
  }, [connected, connecting, authorizedWallet, selectedAccount, publicKey]);

  useEffect(() => {
    if (manuallyDisconnected) {
      console.log("🔍 Skipping auto-reconnect (manual disconnect)");
      return;
    }
    if (connected || authorizedWallet) {
      console.log("🔍 Skipping connection check - already connected");
      return;
    }

    if (
      typeof window !== "undefined" &&
      (isWalletBrowser() || isSolanaWalletAvailable())
    ) {
      const checkConnection = async () => {
        try {
          const wallet = getWalletProvider();
          console.log("🔍 Checking wallet provider:", {
            hasWallet: !!wallet,
            isConnected: wallet?.isConnected,
            walletName: wallet?.name,
          });

          if (wallet && wallet.isConnected) {
            console.log("🔍 Checking existing wallet connection...");

            let accounts = null;
            if (typeof wallet.getAccounts === "function") {
              accounts = await wallet.getAccounts();
            } else if (wallet.publicKey) {
              accounts = [{ publicKey: wallet.publicKey }];
            } else if (typeof wallet.getAccountInfo === "function") {
              try {
                const accountInfo = await wallet.getAccountInfo();
                if (accountInfo) {
                  accounts = [{ publicKey: accountInfo.publicKey }];
                }
              } catch (e) {
                console.log("🔍 getAccountInfo failed:", e);
              }
            }

            console.log("🔍 Got accounts:", accounts);

            if (accounts && accounts.length > 0) {
              const account = accounts[0];
              const pubKey = new PublicKey(account.publicKey);
              setPublicKey(pubKey);
              setConnected(true);
              const walletAccount: SimpleWebWalletAccount = {
                address: pubKey.toString(),
                label: wallet.name || "Wallet",
                publicKey: pubKey,
              };
              setAuthorizedWallet({
                accounts: [walletAccount],
                selectedAccount: walletAccount,
              });
              console.log(
                "✅ Found existing wallet connection:",
                pubKey.toString()
              );
            } else {
              console.log("🔍 No accounts found in wallet");
            }
          } else {
            console.log("🔍 Wallet not connected or not available");
          }
        } catch (error) {
          console.log("🔍 Error checking existing wallet connection:", error);
        }
      };
      checkConnection();
    }
  }, [connected, authorizedWallet, manuallyDisconnected]);

  const connect = useCallback(async () => {
    if (connecting || connected) return;
    try {
      setConnecting(true);
      setManuallyDisconnected(false);
      console.log("🔄 Initiating simple web wallet connection...");

      if (!isWalletBrowser() && !isSolanaWalletAvailable()) {
        throw new Error(
          "No Solana wallet detected. Please install Phantom, Solflare, or another Solana wallet extension."
        );
      }

      const wallet = getWalletProvider();
      if (!wallet) {
        throw new Error(
          "No Solana wallet detected. Please install Phantom, Solflare, or another Solana wallet extension."
        );
      }

      const response = await wallet.connect();
      if (response.publicKey) {
        const pubKey = new PublicKey(response.publicKey);
        setPublicKey(pubKey);
        setConnected(true);
        const walletAccount: SimpleWebWalletAccount = {
          address: pubKey.toString(),
          label: wallet.name || "Wallet",
          publicKey: pubKey,
        };
        setAuthorizedWallet({
          accounts: [walletAccount],
          selectedAccount: walletAccount,
        });
        console.log(
          "✅ Simple web wallet connected successfully:",
          pubKey.toString()
        );
      } else {
        throw new Error("Failed to get public key from wallet");
      }
    } catch (error: any) {
      console.error("❌ Simple web wallet connection failed:", error);
      throw new Error(`Web wallet connection failed: ${error.message}`);
    } finally {
      setConnecting(false);
    }
  }, [connecting, connected]);

  const disconnect = useCallback(async () => {
    console.log("🔄 Disconnecting simple web wallet...");
    if (typeof window !== "undefined") {
      const wallet = getWalletProvider();
      if (wallet && wallet.disconnect) {
        try {
          await wallet.disconnect();
        } catch (e) {
          console.warn("Wallet disconnect error:", e);
        }
      }
      if (wallet) {
        if ("isConnected" in wallet) wallet.isConnected = false;
        if ("publicKey" in wallet) wallet.publicKey = null;
      }
    }
    setAuthorizedWallet(null);
    setPublicKey(null);
    setConnected(false);
    setManuallyDisconnected(true);
    console.log("✅ Simple web wallet disconnected");
  }, []);

  const reauthorize = useCallback(async () => {
    if (!connected) {
      throw new Error("No wallet connected to reauthorize");
    }
    console.log("✅ Simple web wallet reauthorization successful (no action needed)");
  }, [connected]);

  const signTransaction = useCallback(
    async (transaction: Transaction | VersionedTransaction) => {
      if (!connected || !publicKey) {
        throw new Error("Wallet not connected");
      }
      try {
        console.log("🔄 Signing transaction with simple web wallet...");
        const wallet = getWalletProvider();
        const signedTransaction = await wallet.signTransaction(transaction);
        console.log("✅ Transaction signed successfully with simple web wallet");
        return signedTransaction;
      } catch (error: any) {
        console.error("❌ Simple web wallet transaction signing failed:", error);
        throw new Error(`Transaction signing failed: ${error.message}`);
      }
    },
    [connected, publicKey]
  );

  const signAllTransactions = useCallback(
    async (transactions: (Transaction | VersionedTransaction)[]) => {
      if (!connected || !publicKey) {
        throw new Error("Wallet not connected");
      }
      try {
        console.log(
          `🔄 Signing ${transactions.length} transactions with simple web wallet...`
        );
        const wallet = getWalletProvider();
        const signedTransactions = await wallet.signAllTransactions(transactions);
        console.log("✅ All transactions signed successfully with simple web wallet");
        return signedTransactions;
      } catch (error: any) {
        console.error("❌ Simple web wallet transaction signing failed:", error);
        throw new Error(`Transaction signing failed: ${error.message}`);
      }
    },
    [connected, publicKey]
  );

  const signAndSendTransaction = useCallback(
    async (
      transaction: Transaction | VersionedTransaction,
      connection: Connection
    ): Promise<string> => {
      if (!connected || !publicKey) {
        throw new Error("Wallet not connected");
      }
      try {
        console.log("🔄 Signing and sending transaction with simple web wallet...");
        const wallet = getWalletProvider();
        const signature = await wallet.signAndSendTransaction(transaction);
        console.log("✅ Transaction signed and sent with simple web wallet:", signature);
        console.log("🔄 Waiting for confirmation...");
        const confirmation = await connection.confirmTransaction(
          signature,
          "confirmed"
        );
        if (confirmation.value.err) {
          throw new Error(`Transaction failed: ${confirmation.value.err}`);
        }
        console.log("✅ Transaction confirmed:", signature);
        return signature;
      } catch (error: any) {
        console.error(
          "❌ Simple web wallet transaction signing and sending failed:",
          error
        );
        throw new Error(`Transaction failed: ${error.message}`);
      }
    },
    [connected, publicKey]
  );

  return {
    connecting,
    connected,
    authorizedWallet,
    selectedAccount,
    publicKey,
    connect,
    disconnect,
    reauthorize,
    signTransaction,
    signAllTransactions,
    signAndSendTransaction,
  };
};
