import 'react-native-get-random-values'; // Ensure crypto polyfill is available
import { useCallback, useEffect, useState } from 'react';
import { Connection, clusterApiUrl, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useAuth } from '@/context/auth-context';

interface UseBalanceReturn {
    balance: number | null;
    loading: boolean;
    error: Error | null;
    refreshBalance: () => Promise<void>;
    solPrice: number | null;
}

export const useBalance = (): UseBalanceReturn => {
    const { currentPublicKey, currentPublicKeyObject } = useAuth();
    const [balance, setBalance] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [solPrice, setSolPrice] = useState<number | null>(null);

    const fetchSolPrice = useCallback(async () => {
        try {
            const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
            const data = await response.json();
            setSolPrice(data.solana?.usd || null);
        } catch (err) {
            console.warn('Failed to fetch SOL price:', err);
            // Don't set error for price fetch failure
        }
    }, []);

    const fetchBalance = useCallback(async () => {
        // Use the unified account information from auth context
        if (!currentPublicKey || !currentPublicKeyObject) {
            console.log('⚠️ No account available for balance fetch');
            setBalance(null);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            console.log('🔄 Fetching balance for:', currentPublicKey);

            // Initialize connection to Solana network with commitment level
            const connection = new Connection(
                process.env.EXPO_PUBLIC_RPC_URL || clusterApiUrl("mainnet-beta"),
                {
                    commitment: 'confirmed',
                    confirmTransactionInitialTimeout: 60000,
                }
            );
            console.log('✅ Connection established');

            // Get balance in lamports using the PublicKey object
            const balanceInLamports = await connection.getBalance(currentPublicKeyObject);
            console.log('✅ Balance in lamports:', balanceInLamports);

            // Convert lamports to SOL
            const balanceInSol = balanceInLamports / LAMPORTS_PER_SOL;
            console.log('✅ Balance in SOL:', balanceInSol);

            setBalance(balanceInSol);
        } catch (err) {
            console.error('❌ Error fetching balance:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch balance';
            console.error('❌ Balance fetch error details:', errorMessage);
            setError(err instanceof Error ? err : new Error('Failed to fetch balance'));
        } finally {
            setLoading(false);
        }
    }, [currentPublicKey, currentPublicKeyObject]);

    useEffect(() => {
        // Fetch balance when account changes
        if (currentPublicKey) {
            console.log('🔄 Account changed, fetching balance for:', currentPublicKey);
            fetchBalance();
        } else {
            console.log('⚠️ No account, clearing balance');
            setBalance(null);
        }

        // Always try to fetch SOL price
        fetchSolPrice();
    }, [fetchBalance, fetchSolPrice, currentPublicKey]);

    return {
        balance,
        loading,
        error,
        refreshBalance: fetchBalance,
        solPrice,
    };
};
