import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js';
import { useCallback, useMemo, useState } from 'react';

export interface WebWalletAccount {
  address: string;
  label?: string;
  publicKey: PublicKey;
}

export interface WebAuthorizedWallet {
  accounts: WebWalletAccount[];
  selectedAccount: WebWalletAccount;
}

interface UseWebWalletReturn {
  connecting: boolean;
  connected: boolean;
  authorizedWallet: WebAuthorizedWallet | null;
  selectedAccount: WebWalletAccount | null;
  publicKey: PublicKey | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  reauthorize: () => Promise<void>;
  signTransaction: (transaction: Transaction | VersionedTransaction) => Promise<Transaction | VersionedTransaction>;
  signAllTransactions: (transactions: (Transaction | VersionedTransaction)[]) => Promise<(Transaction | VersionedTransaction)[]>;
  signAndSendTransaction: (transaction: Transaction | VersionedTransaction, connection: Connection) => Promise<string>;
}

export const useWebWallet = (): UseWebWalletReturn => {
  const wallet = useWallet();
  const [connecting, setConnecting] = useState(false);

  const authorizedWallet = useMemo((): WebAuthorizedWallet | null => {
    if (!wallet.connected || !wallet.publicKey) return null;

    const account: WebWalletAccount = {
      address: wallet.publicKey.toString(),
      label: wallet.wallet?.adapter.name || 'Wallet',
      publicKey: wallet.publicKey,
    };

    return {
      accounts: [account],
      selectedAccount: account,
    };
  }, [wallet.connected, wallet.publicKey, wallet.wallet?.adapter.name]);

  const selectedAccount = useMemo(() => {
    return authorizedWallet?.selectedAccount || null;
  }, [authorizedWallet]);

  const publicKey = useMemo(() => {
    return wallet.publicKey;
  }, [wallet.publicKey]);

  const connect = useCallback(async () => {
    if (connecting || wallet.connected) return;

    try {
      setConnecting(true);
      console.log('🔄 Initiating web wallet connection...');

      if (!wallet.wallet) {
        throw new Error('No wallet selected. Please select a wallet first.');
      }

      wallet.select(wallet.wallet.adapter.name);
      await wallet.connect();

      console.log('✅ Web wallet connected successfully:', wallet.publicKey?.toString());
    } catch (error: any) {
      console.error('❌ Web wallet connection failed:', error);
      throw new Error(`Web wallet connection failed: ${error.message}`);
    } finally {
      setConnecting(false);
    }
  }, [connecting, wallet, wallet.connected, wallet.wallet, wallet.publicKey]);

  const disconnect = useCallback(() => {
    console.log('🔄 Disconnecting web wallet...');
    wallet.disconnect();
    console.log('✅ Web wallet disconnected');
  }, [wallet]);

  const reauthorize = useCallback(async () => {
    if (!wallet.connected) {
      throw new Error('No wallet connected to reauthorize');
    }
    console.log('✅ Web wallet reauthorization successful (no action needed)');
  }, [wallet.connected]);

  const signTransaction = useCallback(async (transaction: Transaction | VersionedTransaction) => {
    if (!wallet.connected || !wallet.signTransaction) {
      throw new Error('Wallet not connected or cannot sign transactions');
    }

    try {
      console.log('🔄 Signing transaction with web wallet...');
      const signedTransaction = await wallet.signTransaction(transaction);
      console.log('✅ Transaction signed successfully with web wallet');
      return signedTransaction;
    } catch (error: any) {
      console.error('❌ Web wallet transaction signing failed:', error);
      throw new Error(`Transaction signing failed: ${error.message}`);
    }
  }, [wallet.connected, wallet.signTransaction]);

  const signAllTransactions = useCallback(async (transactions: (Transaction | VersionedTransaction)[]) => {
    if (!wallet.connected || !wallet.signAllTransactions) {
      throw new Error('Wallet not connected or cannot sign multiple transactions');
    }

    try {
      console.log(`🔄 Signing ${transactions.length} transactions with web wallet...`);
      const signedTransactions = await wallet.signAllTransactions(transactions);
      console.log('✅ All transactions signed successfully with web wallet');
      return signedTransactions;
    } catch (error: any) {
      console.error('❌ Web wallet transaction signing failed:', error);
      throw new Error(`Transaction signing failed: ${error.message}`);
    }
  }, [wallet.connected, wallet.signAllTransactions]);

  const signAndSendTransaction = useCallback(async (
    transaction: Transaction | VersionedTransaction,
    connection: Connection
  ): Promise<string> => {
    if (!wallet.connected || !wallet.sendTransaction) {
      throw new Error('Wallet not connected or cannot send transactions');
    }

    try {
      console.log('🔄 Signing and sending transaction with web wallet...');

      const signature = await wallet.sendTransaction(transaction, connection);

      console.log('✅ Transaction signed and sent with web wallet:', signature);

      console.log('🔄 Waiting for confirmation...');
      const confirmation = await connection.confirmTransaction(signature, 'confirmed');

      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${confirmation.value.err}`);
      }

      console.log('✅ Transaction confirmed:', signature);
      return signature;
    } catch (error: any) {
      console.error('❌ Web wallet transaction signing and sending failed:', error);
      throw new Error(`Transaction failed: ${error.message}`);
    }
  }, [wallet.connected, wallet.sendTransaction]);

  return {
    connecting: connecting || wallet.connecting,
    connected: wallet.connected,
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
