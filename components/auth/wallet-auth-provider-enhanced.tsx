import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'

import {
  PublicKey,
  Transaction,
  VersionedTransaction,
  TransactionSignature,
} from '@solana/web3.js'
import { Platform } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {
  transact,
} from '@solana-mobile/mobile-wallet-adapter-protocol-web3js'
import { SignInPayload } from '@solana-mobile/mobile-wallet-adapter-protocol'
import type { SolanaSignInInput, SolanaSignInOutput } from '@solana/wallet-standard-features'

// Import the existing mobile auth hooks
import { Account, useAuthorization } from './useAuthorization'
import { useConnection } from './ConnectionProvider'

// Import SIWS utilities
import { createSignInData, verifySolanaSignIn, createSIWSPayload } from '@/utils/siws'

interface WalletAccount {
  address: string
  publicKey: PublicKey
  label?: string
}

interface SIWSSession {
  account: WalletAccount
  signInData: SolanaSignInInput
  signedAt: string
  expiresAt?: string
}

// Enhanced context that includes SIWS state but maintains backward compatibility
interface WalletAuthContextState {
  isConnected: boolean
  isLoading: boolean
  account: WalletAccount | null
  isSignedIn: boolean
  siwsSession: SIWSSession | null
  connect: () => Promise<void>
  signIn?: (signInPayload?: SignInPayload) => Promise<void>
  performSIWS: () => Promise<void>
  disconnect: () => Promise<void>
  signAndSendTransaction: (
    transaction: Transaction | VersionedTransaction,
    minContextSlot?: number
  ) => Promise<TransactionSignature>
  signTransaction: (
    transaction: Transaction | VersionedTransaction
  ) => Promise<Transaction | VersionedTransaction>
  signMessage: (message: Uint8Array) => Promise<Uint8Array>
}

const WalletAuthContext = createContext<WalletAuthContextState | null>(null)

// Storage keys for SIWS session persistence
const SIWS_STORAGE_KEYS = {
  WEB_SESSION: 'siws_web_session',
  MOBILE_SESSION: 'siws_mobile_session',
} as const

export function WalletAuthProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [account, setAccount] = useState<WalletAccount | null>(null)
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [siwsSession, setSiwsSession] = useState<SIWSSession | null>(null)

  // Get connection for web wallet transactions
  const { connection } = useConnection()

  // Mobile wallet hooks (existing functionality)
  const mobileAuth = useAuthorization()

  useEffect(() => {
    initializeWalletConnection()
  }, [])

  // Monitor mobile auth state changes
  useEffect(() => {
    if (Platform.OS !== 'web' && mobileAuth.selectedAccount) {
      const walletAccount = {
        address: mobileAuth.selectedAccount.address,
        publicKey: mobileAuth.selectedAccount.publicKey,
        label: mobileAuth.selectedAccount.label || 'Mobile Wallet',
      }
      setAccount(walletAccount)
      setIsConnected(true)

      // Check for existing SIWS session for mobile
      checkExistingSIWSSession(walletAccount, 'mobile')
    } else if (Platform.OS !== 'web' && !mobileAuth.selectedAccount) {
      setAccount(null)
      setIsConnected(false)
      setIsSignedIn(false)
      setSiwsSession(null)
    }
  }, [mobileAuth.selectedAccount])

  const initializeWalletConnection = async () => {
    setIsLoading(true)
    try {
      if (Platform.OS === 'web') {
        await initializeWebWallet()
      } else {
        // Mobile initialization is handled by useAuthorization hook
        setIsLoading(mobileAuth.isLoading)
      }
    } catch (error) {
      console.error('Failed to initialize wallet connection:', error)
    } finally {
      if (Platform.OS === 'web') {
        setIsLoading(false)
      }
    }
  }

  const initializeWebWallet = async () => {
    const wallet = getWebWallet()
    if (wallet?.publicKey) {
      const publicKey = new PublicKey(wallet.publicKey)
      const walletAccount = {
        address: publicKey.toString(),
        publicKey,
        label: wallet.name || 'Web Wallet',
      }
      setAccount(walletAccount)
      setIsConnected(true)

      // Check for existing SIWS session for web
      await checkExistingSIWSSession(walletAccount, 'web')
    }
  }

  const checkExistingSIWSSession = async (walletAccount: WalletAccount, platform: 'web' | 'mobile') => {
    try {
      const storageKey = platform === 'web' ? SIWS_STORAGE_KEYS.WEB_SESSION : SIWS_STORAGE_KEYS.MOBILE_SESSION
      const sessionData = platform === 'web'
        ? localStorage.getItem(storageKey)
        : await AsyncStorage.getItem(storageKey)

      if (sessionData) {
        const session: SIWSSession = JSON.parse(sessionData)

        // Verify session is for the same account
        if (session.account.address === walletAccount.address) {
          // Check if session is still valid
          const now = new Date()
          const expiresAt = session.expiresAt ? new Date(session.expiresAt) : null

          if (!expiresAt || expiresAt > now) {
            setSiwsSession(session)
            setIsSignedIn(true)
            console.log('🔐 Restored existing SIWS session for', walletAccount.address)
            return
          } else {
            console.log('⏰ SIWS session expired, clearing...')
            await clearSIWSSession(platform)
          }
        }
      }
    } catch (error) {
      console.error('Error checking existing SIWS session:', error)
    }
  }

  const saveSIWSSession = async (session: SIWSSession, platform: 'web' | 'mobile') => {
    try {
      const storageKey = platform === 'web' ? SIWS_STORAGE_KEYS.WEB_SESSION : SIWS_STORAGE_KEYS.MOBILE_SESSION
      const sessionData = JSON.stringify(session)

      if (platform === 'web') {
        localStorage.setItem(storageKey, sessionData)
      } else {
        await AsyncStorage.setItem(storageKey, sessionData)
      }
    } catch (error) {
      console.error('Error saving SIWS session:', error)
    }
  }

  const clearSIWSSession = async (platform: 'web' | 'mobile') => {
    try {
      const storageKey = platform === 'web' ? SIWS_STORAGE_KEYS.WEB_SESSION : SIWS_STORAGE_KEYS.MOBILE_SESSION

      if (platform === 'web') {
        localStorage.removeItem(storageKey)
      } else {
        await AsyncStorage.removeItem(storageKey)
      }

      setSiwsSession(null)
      setIsSignedIn(false)
    } catch (error) {
      console.error('Error clearing SIWS session:', error)
    }
  }

  // SIWS implementation
  const performSIWS = async () => {
    if (!account) {
      throw new Error('No wallet connected')
    }

    try {
      console.log('🔐 Starting Sign In with Solana...')
      const signInData = await createSignInData()

      if (Platform.OS === 'web') {
        await performWebSIWS(signInData)
      } else {
        await performMobileSIWS(signInData)
      }
    } catch (error) {
      console.error('SIWS failed:', error)
      throw error
    }
  }

  const performWebSIWS = async (signInData: SolanaSignInInput) => {
    const wallet = getWebWallet()
    if (!wallet?.signIn) {
      throw new Error('Wallet does not support Sign In with Solana')
    }

    try {
      const output: SolanaSignInOutput = await wallet.signIn(signInData)
      // Verify the sign-in output
      const backendOutput: SolanaSignInOutput = {
        account: {
          //@ts-ignore
          publicKey: new Uint8Array(output.account.publicKey),
          ...output.account
        },
        signature: new Uint8Array(output.signature),
        signedMessage: new Uint8Array(output.signedMessage),
      }

      if (!verifySolanaSignIn(signInData, backendOutput)) {
        throw new Error('SIWS verification failed')
      }

      // Create and save session
      const session: SIWSSession = {
        account: account!,
        signInData,
        signedAt: new Date().toISOString(),
        expiresAt: signInData.expirationTime,
      }

      await saveSIWSSession(session, 'web')
      setSiwsSession(session)
      setIsSignedIn(true)

      console.log('✅ SIWS completed successfully for web wallet')
    } catch (error) {
      console.error('Web SIWS failed:', error)
      throw error
    }
  }

  const performMobileSIWS = async (signInData: SolanaSignInInput) => {
    // For mobile, we'll use a simplified approach since mobile wallet adapter
    // doesn't directly support SIWS, but we can simulate it with signMessage
    try {
      const message = `${signInData.domain} wants you to sign in with your Solana account:\n${account!.address}\n\n${signInData.statement}\n\nURI: ${signInData.uri}\nVersion: ${signInData.version}\nChain ID: ${signInData.chainId}\nNonce: ${signInData.nonce}\nIssued At: ${signInData.issuedAt}${signInData.expirationTime ? `\nExpiration Time: ${signInData.expirationTime}` : ''}${signInData.resources ? `\nResources:\n${signInData.resources.map(r => `- ${r}`).join('\n')}` : ''}`

      const encodedMessage = new TextEncoder().encode(message)

      await transact(async (wallet) => {
        const authResult = await mobileAuth.authorizeSession(wallet)
        const signedMessages = await wallet.signMessages({
          addresses: [authResult.address],
          payloads: [encodedMessage],
        })

        // Create and save session
        const session: SIWSSession = {
          account: account!,
          signInData,
          signedAt: new Date().toISOString(),
          expiresAt: signInData.expirationTime,
        }

        await saveSIWSSession(session, 'mobile')
        setSiwsSession(session)
        setIsSignedIn(true)

        console.log('✅ SIWS completed successfully for mobile wallet')
      })
    } catch (error) {
      console.error('Mobile SIWS failed:', error)
      throw error
    }
  }

  const connect = async () => {
    if (isLoading) return
    setIsLoading(true)
    try {
      if (Platform.OS === 'web') {
        await connectWebWallet()
      } else {
        await connectMobileWallet()
      }
    } catch (error) {
      console.error('Wallet connection failed:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signIn = async (signInPayload?: SignInPayload) => {
    if (Platform.OS === 'web') {
      // For web, perform SIWS after connection
      await connect()
      await performSIWS()
    } else {
      // For mobile, use existing signIn functionality with SIWS enhancement
      setIsLoading(true)
      try {
        await transact(async (wallet) => {
          const account = signInPayload
            ? await mobileAuth.authorizeSessionWithSignIn(wallet, signInPayload)
            : await mobileAuth.authorizeSession(wallet)

          const walletAccount = {
            address: account.address,
            publicKey: account.publicKey,
            label: account.label || 'Mobile Wallet',
          }
          setAccount(walletAccount)
          setIsConnected(true)

          // Automatically perform SIWS after successful sign-in
          await performSIWS()
        })
      } catch (error) {
        console.error('Sign-in failed:', error)
        throw error
      } finally {
        setIsLoading(false)
      }
    }
  }

  const connectWebWallet = async () => {
    const wallet = getWebWallet()
    if (!wallet) {
      throw new Error('No Solana wallet found. Please install a wallet.')
    }
    const response = await wallet.connect()
    const publicKey = new PublicKey(response.publicKey || wallet.publicKey)
    const walletAccount = {
      address: publicKey.toString(),
      publicKey,
      label: wallet.name || 'Web Wallet',
    }
    setAccount(walletAccount)
    setIsConnected(true)

    // Check for existing SIWS session
    await checkExistingSIWSSession(walletAccount, 'web')
  }

  const connectMobileWallet = async () => {
    await transact(async (wallet) => {
      const account = await mobileAuth.authorizeSession(wallet)
      const walletAccount = {
        address: account.address,
        publicKey: account.publicKey,
        label: account.label || 'Mobile Wallet',
      }
      setAccount(walletAccount)
      setIsConnected(true)

      // Check for existing SIWS session
      await checkExistingSIWSSession(walletAccount, 'mobile')
    })
  }

  const disconnect = async () => {
    try {
      if (Platform.OS === 'web') {
        const wallet = getWebWallet()
        if (wallet?.disconnect) {
          await wallet.disconnect()
        }
        await clearSIWSSession('web')
      } else {
        await transact(async (wallet) => {
          await mobileAuth.deauthorizeSession(wallet)
        })
        await clearSIWSSession('mobile')
      }
      setAccount(null)
      setIsConnected(false)
      setIsSignedIn(false)
      setSiwsSession(null)
    } catch (error) {
      console.error('Disconnect failed:', error)
    }
  }

  const signAndSendTransaction = async (
    transaction: Transaction | VersionedTransaction,
    minContextSlot?: number
  ): Promise<TransactionSignature> => {
    if (!account) {
      throw new Error('No wallet connected')
    }
    if (Platform.OS === 'web') {
      return await signAndSendWebTransaction(transaction)
    } else {
      return await signAndSendMobileTransaction(transaction, minContextSlot)
    }
  }

  const signTransaction = async (
    transaction: Transaction | VersionedTransaction
  ): Promise<Transaction | VersionedTransaction> => {
    if (!account) {
      throw new Error('No wallet connected')
    }
    if (Platform.OS === 'web') {
      return await signWebTransaction(transaction)
    } else {
      return await signMobileTransaction(transaction)
    }
  }

  const signMessage = async (message: Uint8Array): Promise<Uint8Array> => {
    if (!account) {
      throw new Error('No wallet connected')
    }
    if (Platform.OS === 'web') {
      return await signWebMessage(message)
    } else {
      return await signMobileMessage(message)
    }
  }

  const signAndSendWebTransaction = async (
    transaction: Transaction | VersionedTransaction
  ): Promise<TransactionSignature> => {
    const wallet = getWebWallet()
    if (!wallet) throw new Error('No web wallet found')

    if (wallet.signAndSendTransaction) {
      return await wallet.signAndSendTransaction(transaction)
    } else if (wallet.signTransaction) {
      const signedTx = await wallet.signTransaction(transaction)
      return await connection.sendRawTransaction(signedTx.serialize())
    } else {
      throw new Error('Wallet does not support transaction signing')
    }
  }

  const signWebTransaction = async (
    transaction: Transaction | VersionedTransaction
  ): Promise<Transaction | VersionedTransaction> => {
    const wallet = getWebWallet()
    if (!wallet?.signTransaction) {
      throw new Error('Wallet does not support transaction signing')
    }
    return await wallet.signTransaction(transaction)
  }

  const signWebMessage = async (message: Uint8Array): Promise<Uint8Array> => {
    const wallet = getWebWallet()
    if (!wallet?.signMessage) {
      throw new Error('Wallet does not support message signing')
    }
    const result = await wallet.signMessage(message)
    return result.signature
  }

  const signAndSendMobileTransaction = async (
    transaction: Transaction | VersionedTransaction,
    minContextSlot?: number
  ): Promise<TransactionSignature> => {
    return await transact(async (wallet) => {
      await mobileAuth.authorizeSession(wallet)
      const signatures = await wallet.signAndSendTransactions({
        transactions: [transaction],
        ...(minContextSlot && { minContextSlot }),
      })

      if (!signatures?.length) {
        throw new Error('No transaction signature returned')
      }

      return signatures[0]
    })
  }

  const signMobileTransaction = async (
    transaction: Transaction | VersionedTransaction
  ): Promise<Transaction | VersionedTransaction> => {
    return await transact(async (wallet) => {
      await mobileAuth.authorizeSession(wallet)
      const signedTransactions = await wallet.signTransactions({
        transactions: [transaction],
      })
      return signedTransactions[0]
    })
  }

  const signMobileMessage = async (message: Uint8Array): Promise<Uint8Array> => {
    return await transact(async (wallet) => {
      const authResult = await mobileAuth.authorizeSession(wallet)
      const signedMessages = await wallet.signMessages({
        addresses: [authResult.address],
        payloads: [message],
      })
      return signedMessages[0]
    })
  }

  const value: WalletAuthContextState = {
    isConnected,
    isLoading: Platform.OS === 'web' ? isLoading : mobileAuth.isLoading,
    account,
    isSignedIn,
    siwsSession,
    connect,
    signIn,
    performSIWS,
    disconnect,
    signAndSendTransaction,
    signTransaction,
    signMessage,
  }

  return (
    <WalletAuthContext.Provider value={value}>
      {children}
    </WalletAuthContext.Provider>
  )
}

// Backward compatible hook that maintains the original API
export function useWalletAuth() {
  const context = useContext(WalletAuthContext)
  if (!context) {
    throw new Error('useWalletAuth must be used within WalletAuthProvider')
  }

  // Return the enhanced context with SIWS capabilities
  return context
}

function getWebWallet() {
  if (typeof window === 'undefined') return null
  const w = window as any
  if (w.backpack?.isBackpack) return w.backpack
  if (w.solflare?.isSolflare) return w.solflare
  if (w.solana?.isPhantom) return w.solana
  if (w.solana) return w.solana
  return null
}

