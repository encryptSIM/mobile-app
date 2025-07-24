import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, Linking } from 'react-native';
import { Connection, PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js';
import {
    transact,
    Web3MobileWallet,
} from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';

export interface AuthorizedWallet {
    accounts: Account[];
    selectedAccount: Account;
    walletUriBase?: string;
}

export interface Account {
    address: string;
    publicKey: PublicKey;
    label?: string;
}

interface UseMobileWalletReturn {
    // Connection state
    connecting: boolean;
    connected: boolean;
    authorizedWallet: AuthorizedWallet | null;

    // Actions
    connect: () => Promise<void>;
    disconnect: () => void;
    reauthorize: () => Promise<void>;

    // Transaction signing
    signTransaction: (transaction: Transaction | VersionedTransaction) => Promise<Transaction | VersionedTransaction>;
    signAllTransactions: (transactions: (Transaction | VersionedTransaction)[]) => Promise<(Transaction | VersionedTransaction)[]>;
    signAndSendTransaction: (transaction: Transaction | VersionedTransaction, connection: Connection) => Promise<string>;

    // Utility
    selectedAccount: Account | null;
    publicKey: PublicKey | null;
}

// Configuration object for wallet adapter
const WALLET_ADAPTER_CONFIG = {
    appIdentity: {
        name: 'encryptSIM',
        uri: 'https://encryptsim.com', // Replace with your actual domain
        icon: 'favicon.ico', // Replace with your app icon
    },
    authorizationResultCache: {
        clear: async () => {
            // Clear any cached authorization results
            console.log('🔄 Clearing wallet authorization cache');
        },
        get: async () => {
            // Return cached authorization if available
            return null;
        },
        set: async () => {
            // Cache authorization result
            console.log('💾 Caching wallet authorization');
        },
    },
};

export const useMobileWallet = (): UseMobileWalletReturn => {
    const [connecting, setConnecting] = useState(false);
    const [connected, setConnected] = useState(false);
    const [authorizedWallet, setAuthorizedWallet] = useState<AuthorizedWallet | null>(null);

    const appStateRef = useRef(AppState.currentState);

    // Derived state
    const selectedAccount = useMemo(() => {
        return authorizedWallet?.selectedAccount || null;
    }, [authorizedWallet]);

    const publicKey = useMemo(() => {
        return selectedAccount?.publicKey || null;
    }, [selectedAccount]);

    // Handle app state changes for wallet session management
    useEffect(() => {
        const subscription = AppState.addEventListener('change', (nextAppState) => {
            if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
                // App came to foreground - could reauthorize if needed
                console.log('📱 App came to foreground');
            }
            appStateRef.current = nextAppState;
        });

        return () => subscription?.remove();
    }, []);

    // Connect to wallet
    const connect = useCallback(async () => {
        if (connecting) return;

        try {
            setConnecting(true);
            console.log('🔄 Initiating wallet connection...');

            await transact(async (wallet: Web3MobileWallet) => {
                console.log('🔄 Starting wallet authorization...');

                const authResult = await wallet.authorize({
                    identity: WALLET_ADAPTER_CONFIG.appIdentity,
                });

                console.log('✅ Wallet authorization successful:', {
                    accounts: authResult.accounts.length,
                    walletUriBase: authResult.wallet_uri_base,
                });

                // Convert accounts to our format
                const accounts: Account[] = authResult.accounts.map((account) => ({
                    address: account.address,
                    publicKey: new PublicKey(account.address),
                    label: account.label,
                }));

                // Select the first account as the default selected account
                const selectedAccount = accounts[0];

                const authorizedWallet: AuthorizedWallet = {
                    accounts,
                    selectedAccount,
                    walletUriBase: authResult.wallet_uri_base,
                };

                setAuthorizedWallet(authorizedWallet);
                setConnected(true);

                console.log('✅ Wallet connected successfully:', selectedAccount.address);
            });
        } catch (error: any) {
            console.error('❌ Wallet connection failed:', error);

            // Handle specific error cases
            if (error.code === 'ERROR_WALLET_NOT_FOUND') {
                throw new Error('No compatible wallet found. Please install a Solana wallet app.');
            } else if (error.code === 'ERROR_AUTHORIZATION_FAILED') {
                throw new Error('Wallet authorization failed. Please try again.');
            } else if (error.code === 'ERROR_NOT_SIGNED') {
                throw new Error('User declined wallet connection.');
            } else {
                throw new Error(`Wallet connection failed: ${error.message}`);
            }
        } finally {
            setConnecting(false);
        }
    }, [connecting]);

    // Disconnect wallet
    const disconnect = useCallback(() => {
        console.log('🔄 Disconnecting wallet...');
        setAuthorizedWallet(null);
        setConnected(false);
        console.log('✅ Wallet disconnected');
    }, []);

    // Reauthorize wallet (useful for expired sessions)
    const reauthorize = useCallback(async () => {
        if (!authorizedWallet) {
            throw new Error('No wallet connected to reauthorize');
        }

        try {
            console.log('🔄 Reauthorizing wallet...');

            await transact(async (wallet: Web3MobileWallet) => {
                const authResult = await wallet.reauthorize({
                    auth_token: '', // This would need to be stored from the initial authorization
                    identity: WALLET_ADAPTER_CONFIG.appIdentity,
                });

                console.log('✅ Wallet reauthorization successful');

                // Update account info if needed
                const accounts: Account[] = authResult.accounts.map((account) => ({
                    address: account.address,
                    publicKey: new PublicKey(account.address),
                    label: account.label,
                }));

                const selectedAccount = accounts[0];

                setAuthorizedWallet({
                    ...authorizedWallet,
                    accounts,
                    selectedAccount,
                });
            });
        } catch (error: any) {
            console.error('❌ Wallet reauthorization failed:', error);
            throw new Error(`Reauthorization failed: ${error.message}`);
        }
    }, [authorizedWallet]);

    // Sign a single transaction
    const signTransaction = useCallback(async (transaction: Transaction | VersionedTransaction) => {
        if (!authorizedWallet) {
            throw new Error('Wallet not connected');
        }

        try {
            console.log('🔄 Signing transaction...');

            let signedTransaction: Transaction | VersionedTransaction;

            await transact(async (wallet: Web3MobileWallet) => {
                const [signedTx] = await wallet.signTransactions({
                    transactions: [transaction],
                });
                signedTransaction = signedTx;
            });

            console.log('✅ Transaction signed successfully');
            return signedTransaction!;
        } catch (error: any) {
            console.error('❌ Transaction signing failed:', error);
            throw new Error(`Transaction signing failed: ${error.message}`);
        }
    }, [authorizedWallet]);

    // Sign multiple transactions
    const signAllTransactions = useCallback(async (transactions: (Transaction | VersionedTransaction)[]) => {
        if (!authorizedWallet) {
            throw new Error('Wallet not connected');
        }

        try {
            console.log(`🔄 Signing ${transactions.length} transactions...`);

            let signedTransactions: (Transaction | VersionedTransaction)[];

            await transact(async (wallet: Web3MobileWallet) => {
                signedTransactions = await wallet.signTransactions({
                    transactions,
                });
            });

            console.log('✅ All transactions signed successfully');
            return signedTransactions!;
        } catch (error: any) {
            console.error('❌ Transaction signing failed:', error);
            throw new Error(`Transaction signing failed: ${error.message}`);
        }
    }, [authorizedWallet]);

    // Sign and send transaction
    const signAndSendTransaction = useCallback(async (
        transaction: Transaction | VersionedTransaction,
        connection: Connection
    ): Promise<string> => {
        if (!authorizedWallet) {
            throw new Error('Wallet not connected');
        }

        try {
            console.log('🔄 Signing and sending transaction...');

            let signature = '';

            await transact(async (wallet: Web3MobileWallet) => {
                const signatures = await wallet.signAndSendTransactions({
                    transactions: [transaction],
                });
                signature = signatures[0]; // signAndSendTransactions returns an array of signature strings
            });

            console.log('✅ Transaction signed and sent:', signature);

            // Wait for confirmation
            console.log('🔄 Waiting for confirmation...');
            const confirmation = await connection.confirmTransaction(signature, 'confirmed');

            if (confirmation.value.err) {
                throw new Error(`Transaction failed: ${confirmation.value.err}`);
            }

            console.log('✅ Transaction confirmed:', signature);
            return signature;
        } catch (error: any) {
            console.error('❌ Transaction signing and sending failed:', error);
            throw new Error(`Transaction failed: ${error.message}`);
        }
    }, [authorizedWallet]);

    return {
        // State
        connecting,
        connected,
        authorizedWallet,
        selectedAccount,
        publicKey,

        // Actions
        connect,
        disconnect,
        reauthorize,

        // Transaction signing
        signTransaction,
        signAllTransactions,
        signAndSendTransaction,
    };
}; 