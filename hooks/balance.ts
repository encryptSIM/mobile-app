import { useCallback, useEffect, useState } from 'react';
import { Connection, PublicKey, LAMPORTS_PER_SOL, clusterApiUrl } from '@solana/web3.js';
import 'react-native-get-random-values';
import { Buffer } from 'buffer';

// Polyfill for Buffer
global.Buffer = Buffer;

interface UseBalanceReturn {
    balance: number | null;
    loading: boolean;
    error: Error | null;
    refreshBalance: () => Promise<void>;
    solPrice: number | null;
}

export const useBalance = (address: string): UseBalanceReturn => {
    const [balance, setBalance] = useState<number | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);
    const [solPrice, setSolPrice] = useState<number | null>(null);

    const fetchSolPrice = useCallback(async () => {
        try {
            const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
            const data = await response.json();
            setSolPrice(data.solana.usd);
        } catch (err) {
            console.error('Error fetching SOL price:', err);
        }
    }, []);

    const fetchBalance = useCallback(async () => {
        if (!address) return;

        try {
            setLoading(true);
            setError(null);


            // Initialize connection to Solana network with commitment level
            const connection = new Connection(process.env.EXPO_PUBLIC_RPC_URL || clusterApiUrl("mainnet-beta"), {
                commitment: 'confirmed',
                confirmTransactionInitialTimeout: 60000,
            });
            console.log('Connection:', connection);

            // Convert address string to PublicKey
            const publicKey = new PublicKey(address);
            console.log('PublicKey:', publicKey.toString());

            // Get balance in lamports
            const balanceInLamports = await connection.getBalance(publicKey);
            console.log('Balance in lamports:', balanceInLamports);

            // Convert lamports to SOL
            const balanceInSol = balanceInLamports / LAMPORTS_PER_SOL;
            console.log('Balance in SOL:', balanceInSol);

            setBalance(balanceInSol);
        } catch (err) {
            console.error('Error fetching balance:', err);
            setError(err instanceof Error ? err : new Error('Failed to fetch balance'));
        } finally {
            setLoading(false);
        }
    }, [address]);

    useEffect(() => {
        fetchBalance();
        fetchSolPrice();
    }, [fetchBalance, fetchSolPrice]);

    return {
        balance,
        loading,
        error,
        refreshBalance: fetchBalance,
        solPrice,
    };
};
