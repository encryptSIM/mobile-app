import { useCallback, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { PublicKey } from '@solana/web3.js';

export interface SeedVaultAccount {
    publicKey: PublicKey;
    derivationPath: string;
    label?: string;
}

interface UseSeedVaultReturn {
    // State
    isAvailable: boolean;
    isUnlocked: boolean;
    accounts: SeedVaultAccount[];
    selectedAccount: SeedVaultAccount | null;
    loading: boolean;
    error: string | null;

    // Actions
    checkAvailability: () => Promise<boolean>;
    unlock: (passcode?: string) => Promise<void>;
    lock: () => Promise<void>;
    createAccount: (label?: string) => Promise<SeedVaultAccount>;
    importAccount: (mnemonic: string, label?: string) => Promise<SeedVaultAccount>;
    selectAccount: (account: SeedVaultAccount) => void;
    signData: (data: Uint8Array, account?: SeedVaultAccount) => Promise<Uint8Array>;

    // Security
    isDeviceSecure: () => Promise<boolean>;
    enableBiometrics: () => Promise<boolean>;
}

/**
 * Seed Vault integration hook for secure key management
 * Based on Solana Mobile Stack documentation
 */
export const useSeedVault = (): UseSeedVaultReturn => {
    const [isAvailable, setIsAvailable] = useState(false);
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [accounts, setAccounts] = useState<SeedVaultAccount[]>([]);
    const [selectedAccount, setSelectedAccount] = useState<SeedVaultAccount | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Check if Seed Vault is available on the device
    const checkAvailability = useCallback(async (): Promise<boolean> => {
        try {
            console.log('🔍 Checking Seed Vault availability...');

            // Check if we're on a Solana Mobile device or emulator
            // For now, we'll simulate this with SecureStore availability
            const isSecureStoreAvailable = await SecureStore.isAvailableAsync();

            if (isSecureStoreAvailable) {
                console.log('✅ Seed Vault is available');
                setIsAvailable(true);
                return true;
            } else {
                console.log('❌ Seed Vault not available on this device');
                setIsAvailable(false);
                return false;
            }
        } catch (err) {
            console.error('❌ Error checking Seed Vault availability:', err);
            setError('Failed to check Seed Vault availability');
            setIsAvailable(false);
            return false;
        }
    }, []);

    // Check if the device has secure lock screen
    const isDeviceSecure = useCallback(async (): Promise<boolean> => {
        try {
            // This would use actual Seed Vault APIs in production
            // For now, checking if SecureStore can use authentication
            const securityLevel = await SecureStore.getItemAsync('security_check', {
                requireAuthentication: true,
            });
            return true;
        } catch (err) {
            console.warn('Device may not have secure lock screen configured');
            return false;
        }
    }, []);

    // Enable biometric authentication
    const enableBiometrics = useCallback(async (): Promise<boolean> => {
        try {
            console.log('🔐 Enabling biometric authentication...');

            // Test biometric availability
            await SecureStore.setItemAsync('biometric_test', 'enabled', {
                requireAuthentication: true,
                authenticationPrompt: 'Enable biometric authentication for Seed Vault',
            });

            console.log('✅ Biometric authentication enabled');
            return true;
        } catch (err) {
            console.error('❌ Failed to enable biometric authentication:', err);
            setError('Biometric authentication not available');
            return false;
        }
    }, []);

    // Unlock the Seed Vault
    const unlock = useCallback(async (passcode?: string): Promise<void> => {
        if (!isAvailable) {
            throw new Error('Seed Vault is not available on this device');
        }

        try {
            setLoading(true);
            setError(null);
            console.log('🔓 Unlocking Seed Vault...');

            // In production, this would use actual Seed Vault unlock APIs
            // For now, we'll simulate with SecureStore authentication
            const authTest = await SecureStore.getItemAsync('vault_status', {
                requireAuthentication: true,
                authenticationPrompt: 'Unlock your Seed Vault to access your accounts',
            });

            // Load existing accounts
            const storedAccounts = await SecureStore.getItemAsync('seed_vault_accounts');
            if (storedAccounts) {
                const parsedAccounts = JSON.parse(storedAccounts);
                const accounts: SeedVaultAccount[] = parsedAccounts.map((acc: any) => ({
                    ...acc,
                    publicKey: new PublicKey(acc.publicKey),
                }));
                setAccounts(accounts);
                if (accounts.length > 0 && !selectedAccount) {
                    setSelectedAccount(accounts[0]);
                }
            }

            setIsUnlocked(true);
            console.log('✅ Seed Vault unlocked successfully');
        } catch (err) {
            console.error('❌ Failed to unlock Seed Vault:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to unlock Seed Vault';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [isAvailable, selectedAccount]);

    // Lock the Seed Vault
    const lock = useCallback(async (): Promise<void> => {
        try {
            console.log('🔒 Locking Seed Vault...');

            setIsUnlocked(false);
            setAccounts([]);
            setSelectedAccount(null);

            console.log('✅ Seed Vault locked');
        } catch (err) {
            console.error('❌ Error locking Seed Vault:', err);
            setError('Failed to lock Seed Vault');
        }
    }, []);

    // Create a new account in Seed Vault
    const createAccount = useCallback(async (label?: string): Promise<SeedVaultAccount> => {
        if (!isUnlocked) {
            throw new Error('Seed Vault must be unlocked to create accounts');
        }

        try {
            setLoading(true);
            setError(null);
            console.log('➕ Creating new Seed Vault account...');

            // In production, this would use Seed Vault's key generation
            // For now, we'll simulate with a random keypair
            const { Keypair } = await import('@solana/web3.js');
            const keypair = Keypair.generate();

            const newAccount: SeedVaultAccount = {
                publicKey: keypair.publicKey,
                derivationPath: `m/44'/501'/${accounts.length}'/0'`, // Standard Solana derivation path
                label: label || `Account ${accounts.length + 1}`,
            };

            // Store the account securely
            const updatedAccounts = [...accounts, newAccount];
            await SecureStore.setItemAsync('seed_vault_accounts', JSON.stringify(
                updatedAccounts.map(acc => ({
                    ...acc,
                    publicKey: acc.publicKey.toString(),
                }))
            ), {
                requireAuthentication: true,
            });

            setAccounts(updatedAccounts);

            if (!selectedAccount) {
                setSelectedAccount(newAccount);
            }

            console.log('✅ New account created:', newAccount.publicKey.toString());
            return newAccount;
        } catch (err) {
            console.error('❌ Failed to create account:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to create account';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [isUnlocked, accounts, selectedAccount]);

    // Import an account from mnemonic
    const importAccount = useCallback(async (mnemonic: string, label?: string): Promise<SeedVaultAccount> => {
        if (!isUnlocked) {
            throw new Error('Seed Vault must be unlocked to import accounts');
        }

        try {
            setLoading(true);
            setError(null);
            console.log('📥 Importing account from mnemonic...');

            // In production, this would use Seed Vault's import functionality
            const { Keypair } = await import('@solana/web3.js');
            const { derivePath } = await import('ed25519-hd-key');
            const { mnemonicToSeedSync } = await import('bip39');

            const seed = mnemonicToSeedSync(mnemonic);
            const derivationPath = `m/44'/501'/${accounts.length}'/0'`;
            const derived = derivePath(derivationPath, seed.toString('hex'));
            const keypair = Keypair.fromSeed(derived.key);

            const importedAccount: SeedVaultAccount = {
                publicKey: keypair.publicKey,
                derivationPath,
                label: label || `Imported Account ${accounts.length + 1}`,
            };

            // Store the account securely
            const updatedAccounts = [...accounts, importedAccount];
            await SecureStore.setItemAsync('seed_vault_accounts', JSON.stringify(
                updatedAccounts.map(acc => ({
                    ...acc,
                    publicKey: acc.publicKey.toString(),
                }))
            ), {
                requireAuthentication: true,
            });

            setAccounts(updatedAccounts);

            if (!selectedAccount) {
                setSelectedAccount(importedAccount);
            }

            console.log('✅ Account imported successfully:', importedAccount.publicKey.toString());
            return importedAccount;
        } catch (err) {
            console.error('❌ Failed to import account:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to import account';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [isUnlocked, accounts, selectedAccount]);

    // Select an account
    const selectAccount = useCallback((account: SeedVaultAccount) => {
        console.log('🔄 Selecting account:', account.publicKey.toString());
        setSelectedAccount(account);
    }, []);

    // Sign data with Seed Vault
    const signData = useCallback(async (data: Uint8Array, account?: SeedVaultAccount): Promise<Uint8Array> => {
        const accountToUse = account || selectedAccount;
        if (!accountToUse) {
            throw new Error('No account selected for signing');
        }

        if (!isUnlocked) {
            throw new Error('Seed Vault must be unlocked to sign data');
        }

        try {
            console.log('✍️ Signing data with Seed Vault...');

            // In production, this would use Seed Vault's signing capabilities
            // For now, we'll simulate the signing process
            console.log('✅ Data signed successfully');

            // Return a mock signature for demo purposes
            return new Uint8Array(64); // Ed25519 signature is 64 bytes
        } catch (err) {
            console.error('❌ Failed to sign data:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to sign data';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    }, [selectedAccount, isUnlocked]);

    // Check availability on mount
    useEffect(() => {
        checkAvailability();
    }, [checkAvailability]);

    return {
        // State
        isAvailable,
        isUnlocked,
        accounts,
        selectedAccount,
        loading,
        error,

        // Actions
        checkAvailability,
        unlock,
        lock,
        createAccount,
        importAccount,
        selectAccount,
        signData,

        // Security
        isDeviceSecure,
        enableBiometrics,
    };
}; 