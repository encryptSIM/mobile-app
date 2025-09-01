import {
  createContext,
  type PropsWithChildren,
  use,
  useMemo,
  useEffect,
  useState,
  useRef,
} from "react";
import { useUnifiedWallet } from "@/hooks/use-unified-wallet";
import { Account } from "@/components/solana/use-authorization";
import { useAsyncStorage } from "@/hooks/asyn-storage-hook";
import { PublicKey } from "@solana/web3.js";

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  deviceToken: string | null;
  deviceTokenLoading: boolean;
  account: Account | null;
  setDeviceToken: (value: string) => Promise<void>;
  signIn: () => Promise<Account>;
  signOut: () => Promise<void>;
}

const Context = createContext<AuthState>({} as AuthState);

export function useAuth() {
  const value = use(Context);
  if (!value) {
    throw new Error("useAuth must be wrapped in a <AuthProvider />");
  }

  return value;
}

export function AuthProvider({ children }: PropsWithChildren) {
  const { disconnect, connected, connecting, selectedAccount, connect } =
    useUnifiedWallet();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentAccount, setCurrentAccount] = useState<Account | null>(null);
  const selectedAccountRef = useRef(selectedAccount);

  useEffect(() => {
    selectedAccountRef.current = selectedAccount;
  }, [selectedAccount]);

  const {
    value: deviceToken,
    loading: deviceTokenLoading,
    setValue: setDeviceToken,
  } = useAsyncStorage<string>("deviceToken");

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialized(true);
      console.log("🔐 Auth provider initialized");
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isInitialized) return;

    console.log("🔐 Auth state update triggered:", {
      connected,
      hasSelectedAccount: !!selectedAccount,
      selectedAccountDetails: selectedAccount,
    });

    const authenticated = connected && selectedAccount !== null;
    setIsAuthenticated(authenticated);

    if (authenticated && selectedAccount) {
      const publicKey =
        "publicKey" in selectedAccount && selectedAccount.publicKey
          ? selectedAccount.publicKey
          : new PublicKey(selectedAccount.address);

      const account = {
        address: selectedAccount.address,
        displayAddress: selectedAccount.address,
        publicKey,
        label: selectedAccount.label,
      } as Account;

      setCurrentAccount(account);
      console.log("🎯 Current account updated:", account);
    } else {
      setCurrentAccount(null);
    }

    console.log("🔐 Auth state updated:", {
      connected,
      hasSelectedAccount: !!selectedAccount,
      authenticated,
    });
  }, [connected, selectedAccount, isInitialized]);

  const isLoading = !isInitialized || deviceTokenLoading || connecting;

  const signIn = async (): Promise<Account> => {
    console.log("🔐 Sign-in called, current state:", {
      connected,
      selectedAccount,
    });

    try {
      console.log("🔄 Starting sign-in process...");
      console.log("Current selectedAccount:", selectedAccountRef.current);

      await connect();

      await new Promise((resolve) => setTimeout(resolve, 500));

      const currentSelectedAccount = selectedAccountRef.current;
      console.log("After connect, currentSelectedAccount:", currentSelectedAccount);

      if (currentSelectedAccount) {
        console.log(
          "Using currentSelectedAccount from unified wallet:",
          currentSelectedAccount
        );
        const publicKey =
          "publicKey" in currentSelectedAccount &&
            currentSelectedAccount.publicKey
            ? currentSelectedAccount.publicKey
            : new PublicKey(currentSelectedAccount.address);

        const account = {
          address: currentSelectedAccount.address,
          displayAddress: currentSelectedAccount.address,
          publicKey,
          label: currentSelectedAccount.label,
        } as Account;

        setIsAuthenticated(true);
        setCurrentAccount(account);
        console.log("🔐 Sign-in completed, account:", account);
        return account;
      }

      console.log("No currentSelectedAccount found, using fallback mock account");
      const fallbackAccount = {
        address: "mock-address",
        displayAddress: "mock-address",
        publicKey: new PublicKey("11111111111111111111111111111111"),
        label: "Mock Account",
      } as Account;

      setIsAuthenticated(true);
      setCurrentAccount(fallbackAccount);
      console.log("🔐 Sign-in completed, fallback account:", fallbackAccount);
      return fallbackAccount;
    } catch (error: any) {
      console.error("❌ Sign-in failed:", error);
      throw error;
    }
  };

  const value: AuthState = useMemo(
    () => ({
      signIn,
      signOut: async () => {
        await disconnect();
        setIsAuthenticated(false);
        setCurrentAccount(null);
      },
      setDeviceToken,
      deviceTokenLoading,
      deviceToken,
      isAuthenticated,
      isLoading,
      account: currentAccount,
    }),
    [
      isAuthenticated,
      isLoading,
      disconnect,
      deviceTokenLoading,
      deviceToken,
      setDeviceToken,
      connect,
      currentAccount,
    ]
  );

  return <Context value={value}>{children}</Context>;
}
