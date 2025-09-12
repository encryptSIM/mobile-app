import { useCallback, useMemo } from 'react'
import { transact } from "@solana-mobile/mobile-wallet-adapter-protocol-web3js"
import { Account, useAuthorization } from "./useAuthorization"
import {
  Transaction,
  TransactionSignature,
  VersionedTransaction,
} from "@solana/web3.js"
import { SignInPayload } from "@solana-mobile/mobile-wallet-adapter-protocol"
import { Platform } from 'react-native'

// Import the enhanced wallet provider
import { useWalletAuth as useEnhancedWalletAuth } from './wallet-auth-provider-enhanced'

// Backward compatible interface that matches your existing API
interface BackwardCompatibleWalletAuth {
  connect: () => Promise<Account>
  signIn: (signInPayload: SignInPayload) => Promise<Account>
  disconnect: () => Promise<void>
  signAndSendTransaction: (
    transaction: Transaction | VersionedTransaction,
    minContextSlot: number
  ) => Promise<TransactionSignature>
  signTransaction: (
    transaction: Transaction | VersionedTransaction
  ) => Promise<Transaction | VersionedTransaction>
  signMessage: (message: Uint8Array) => Promise<Uint8Array>
  // Enhanced properties for better state detection
  isConnected: boolean
  isLoading: boolean
  account: any
  isSignedIn: boolean
}

/**
 * Backward compatible useWalletAuth hook that maintains the original API
 * while adding SIWS functionality for better authentication state detection
 */
export function useWalletAuth(): BackwardCompatibleWalletAuth {
  const enhancedAuth = useEnhancedWalletAuth()
  const mobileAuth = useAuthorization()

  const connect = useCallback(async (): Promise<Account> => {
    if (Platform.OS === 'web') {
      await enhancedAuth.connect()
      // For web, we need to convert the account format
      if (enhancedAuth.account) {
        return {
          address: enhancedAuth.account.address,
          publicKey: enhancedAuth.account.publicKey,
          label: enhancedAuth.account.label,
        } as Account
      }
      throw new Error('Connection failed')
    } else {
      // Mobile uses the original implementation
      return await transact(async (wallet) => {
        return await mobileAuth.authorizeSession(wallet)
      })
    }
  }, [enhancedAuth, mobileAuth])

  const signIn = useCallback(
    async (signInPayload: SignInPayload): Promise<Account> => {
      if (Platform.OS === 'web') {
        await enhancedAuth.signIn?.(signInPayload)
        if (enhancedAuth.account) {
          return {
            address: enhancedAuth.account.address,
            publicKey: enhancedAuth.account.publicKey,
            label: enhancedAuth.account.label,
          } as Account
        }
        throw new Error('Sign-in failed')
      } else {
        return await transact(async (wallet) => {
          return await mobileAuth.authorizeSessionWithSignIn(wallet, signInPayload)
        })
      }
    },
    [enhancedAuth, mobileAuth]
  )

  const disconnect = useCallback(async (): Promise<void> => {
    if (Platform.OS === 'web') {
      await enhancedAuth.disconnect()
    } else {
      await transact(async (wallet) => {
        await mobileAuth.deauthorizeSession(wallet)
      })
    }
  }, [enhancedAuth, mobileAuth])

  const signAndSendTransaction = useCallback(
    async (
      transaction: Transaction | VersionedTransaction,
      minContextSlot: number
    ): Promise<TransactionSignature> => {
      if (Platform.OS === 'web') {
        return await enhancedAuth.signAndSendTransaction(transaction, minContextSlot)
      } else {
        return await transact(async (wallet) => {
          await mobileAuth.authorizeSession(wallet)
          const signatures = await wallet.signAndSendTransactions({
            transactions: [transaction],
            minContextSlot,
          })
          return signatures[0]
        })
      }
    },
    [enhancedAuth, mobileAuth]
  )

  const signTransaction = useCallback(
    async (
      transaction: Transaction | VersionedTransaction
    ): Promise<Transaction | VersionedTransaction> => {
      if (Platform.OS === 'web') {
        return await enhancedAuth.signTransaction(transaction)
      } else {
        return await transact(async (wallet) => {
          await mobileAuth.authorizeSession(wallet)
          const signedTransactions = await wallet.signTransactions({
            transactions: [transaction],
          })
          return signedTransactions[0]
        })
      }
    },
    [enhancedAuth, mobileAuth]
  )

  const signMessage = useCallback(
    async (message: Uint8Array): Promise<Uint8Array> => {
      if (Platform.OS === 'web') {
        return await enhancedAuth.signMessage(message)
      } else {
        return await transact(async (wallet) => {
          const authResult = await mobileAuth.authorizeSession(wallet)
          const signedMessages = await wallet.signMessages({
            addresses: [authResult.address],
            payloads: [message],
          })
          return signedMessages[0]
        })
      }
    },
    [enhancedAuth, mobileAuth]
  )

  return useMemo(
    () => ({
      connect,
      signIn,
      disconnect,
      signAndSendTransaction,
      signTransaction,
      signMessage,
      // Enhanced state detection properties
      isConnected: enhancedAuth.isConnected,
      isLoading: enhancedAuth.isLoading,
      account: enhancedAuth.account,
      isSignedIn: enhancedAuth.isSignedIn,
    }),
    [
      connect,
      signIn,
      disconnect,
      signAndSendTransaction,
      signTransaction,
      signMessage,
      enhancedAuth.isConnected,
      enhancedAuth.isLoading,
      enhancedAuth.account,
      enhancedAuth.isSignedIn,
    ]
  )
}

