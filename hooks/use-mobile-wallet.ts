import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppState } from "react-native";
import {
  Connection,
  PublicKey,
  Transaction,
  VersionedTransaction,
} from "@solana/web3.js";
import {
  transact,
  Web3MobileWallet,
} from "@solana-mobile/mobile-wallet-adapter-protocol-web3js";
import { AppConfig } from "@/constants/app-config";
import { ClusterNetwork } from "@/components/cluster/cluster-network";

export interface AuthorizedWallet {
  accounts: Account[];
  selectedAccount: Account;
  walletUriBase?: string;
}

export interface Account {
  address: string;
  label?: string;
}

interface UseMobileWalletReturn {
  connecting: boolean;
  connected: boolean;
  authorizedWallet: AuthorizedWallet | null;
  selectedAccount: Account | null;
  publicKey: PublicKey | null;
  connect: () => Promise<void>;
  disconnect: () => void;
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

const WALLET_ADAPTER_CONFIG = {
  appIdentity: {
    name: "encryptSIM",
    uri: process.env.EXPO_PUBLIC_APP_URL,
    icon: "favicon.ico",
  },
  authorizationResultCache: {
    clear: async () => {
      console.log("🔄 Clearing wallet authorization cache");
    },
    get: async () => {
      return null;
    },
    set: async () => {
      console.log("💾 Caching wallet authorization");
    },
  },
};

function normalizeAccountAddress(raw: any): string {
  try {
    if (typeof raw === "string") {
      try {
        return new PublicKey(raw).toBase58();
      } catch {
        const bytes = Uint8Array.from(atob(raw), (c) => c.charCodeAt(0));
        return new PublicKey(bytes).toBase58();
      }
    }
    if (raw instanceof Uint8Array) {
      return new PublicKey(raw).toBase58();
    }
    throw new Error("Unsupported account address format");
  } catch (e) {
    console.warn("⚠️ Failed to normalize account address:", raw, e);
    return String(raw);
  }
}

export const useMobileWallet = (): UseMobileWalletReturn => {
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [authorizedWallet, setAuthorizedWallet] =
    useState<AuthorizedWallet | null>(null);

  const appStateRef = useRef(AppState.currentState);

  const cluster = AppConfig.clusters[0];

  const chain =
    cluster.network === ClusterNetwork.Mainnet
      ? "solana:mainnet-beta"
      : cluster.network === ClusterNetwork.Testnet
        ? "solana:testnet"
        : "solana:devnet";

  const selectedAccount = useMemo(() => {
    return authorizedWallet?.selectedAccount || null;
  }, [authorizedWallet]);

  const publicKey = useMemo(() => {
    if (selectedAccount?.address) {
      try {
        return new PublicKey(selectedAccount.address);
      } catch (e) {
        console.warn(
          "⚠️ Invalid public key in selectedAccount:",
          selectedAccount.address
        );
        return null;
      }
    }
    return null;
  }, [selectedAccount]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        console.log("📱 App came to foreground");
      }
      appStateRef.current = nextAppState;
    });

    return () => subscription?.remove();
  }, []);

  const connect = useCallback(async () => {
    if (connecting) return;

    try {
      setConnecting(true);
      console.log("🔄 Initiating wallet connection...");

      await transact(async (wallet: Web3MobileWallet) => {
        console.log("🔄 Starting wallet authorization...");

        const cluster = AppConfig.clusters[0];

        const authResult = await wallet.authorize({
          identity: WALLET_ADAPTER_CONFIG.appIdentity,
          chain,
        });

        console.log("🪪 Raw accounts from wallet:", authResult.accounts);

        const accounts: Account[] = authResult.accounts.map((account) => {
          const address = normalizeAccountAddress(account.address);
          console.log("✅ Normalized account:", {
            raw: account.address,
            normalized: address,
          });
          return {
            address,
            label: account.label,
          };
        });

        if (accounts.length === 0) {
          throw new Error(
            "No valid wallet accounts found (invalid base58 public keys)"
          );
        }

        const selectedAccount = accounts[0];

        const authorizedWallet: AuthorizedWallet = {
          accounts,
          selectedAccount,
          walletUriBase: authResult.wallet_uri_base,
        };

        setAuthorizedWallet(authorizedWallet);
        setConnected(true);

        console.log(
          `✅ Wallet connected successfully on ${cluster.name}:`,
          selectedAccount?.address
        );
      });
    } catch (error: any) {
      console.error("❌ Wallet connection failed:", error);
      throw new Error(`Wallet connection failed: ${error.message}`);
    } finally {
      setConnecting(false);
    }
  }, [connecting]);

  const disconnect = useCallback(() => {
    console.log("🔄 Disconnecting wallet...");
    setAuthorizedWallet(null);
    setConnected(false);
    console.log("✅ Wallet disconnected");
  }, []);

  const reauthorize = useCallback(async () => {
    if (!authorizedWallet) {
      throw new Error("No wallet connected to reauthorize");
    }

    try {
      console.log("🔄 Reauthorizing wallet...");

      await transact(async (wallet: Web3MobileWallet) => {
        const authResult = await wallet.reauthorize({
          auth_token: "",
          identity: WALLET_ADAPTER_CONFIG.appIdentity,
        });

        console.log("✅ Wallet reauthorization successful");

        const accounts: Account[] = authResult.accounts.map((account) => {
          const address = normalizeAccountAddress(account.address);
          console.log("✅ Normalized account (reauth):", {
            raw: account.address,
            normalized: address,
          });
          return {
            address,
            label: account.label,
          };
        });

        const selectedAccount = accounts[0];

        setAuthorizedWallet({
          ...authorizedWallet,
          accounts,
          selectedAccount,
        });
      });
    } catch (error: any) {
      console.error("❌ Wallet reauthorization failed:", error);
      throw new Error(`Reauthorization failed: ${error.message}`);
    }
  }, [authorizedWallet]);

  const signTransaction = useCallback(
    async (transaction: Transaction | VersionedTransaction) => {
      if (!authorizedWallet) {
        throw new Error("Wallet not connected");
      }

      try {
        console.log("🔄 Signing transaction...");

        let signedTransaction: Transaction | VersionedTransaction;

        await transact(async (wallet: Web3MobileWallet) => {
          const [signedTx] = await wallet.signTransactions({
            transactions: [transaction],
          });
          signedTransaction = signedTx;
        });

        console.log("✅ Transaction signed successfully");
        return signedTransaction!;
      } catch (error: any) {
        console.error("❌ Transaction signing failed:", error);
        throw new Error(`Transaction signing failed: ${error.message}`);
      }
    },
    [authorizedWallet]
  );

  const signAllTransactions = useCallback(
    async (transactions: (Transaction | VersionedTransaction)[]) => {
      if (!authorizedWallet) {
        throw new Error("Wallet not connected");
      }

      try {
        console.log(`🔄 Signing ${transactions.length} transactions...`);

        let signedTransactions: (Transaction | VersionedTransaction)[];

        await transact(async (wallet: Web3MobileWallet) => {
          signedTransactions = await wallet.signTransactions({
            transactions,
          });
        });

        console.log("✅ All transactions signed successfully");
        return signedTransactions!;
      } catch (error: any) {
        console.error("❌ Transaction signing failed:", error);
        throw new Error(`Transaction signing failed: ${error.message}`);
      }
    },
    [authorizedWallet]
  );

  const signAndSendTransaction = useCallback(
    async (
      transaction: Transaction | VersionedTransaction,
      connection: Connection
    ): Promise<string> => {
      if (!authorizedWallet) {
        throw new Error("Wallet not connected");
      }

      try {
        console.log("🔄 Signing and sending transaction...");

        let signature = "";

        await transact(async (wallet: Web3MobileWallet) => {
          const signatures = await wallet.signAndSendTransactions({
            transactions: [transaction],
          });
          signature = signatures[0];
        });

        console.log("✅ Transaction signed and sent:", signature);

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
        console.error("❌ Transaction signing and sending failed:", error);
        throw new Error(`Transaction failed: ${error.message}`);
      }
    },
    [authorizedWallet]
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
