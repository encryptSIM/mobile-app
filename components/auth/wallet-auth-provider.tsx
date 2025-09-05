import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'
import {
  PublicKey,
  Connection,
  Transaction,
  VersionedTransaction,
  TransactionSignature,
} from '@solana/web3.js'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Platform } from 'react-native'
import {
  transact,
  Web3MobileWallet,
} from '@solana-mobile/mobile-wallet-adapter-protocol-web3js'
import { toByteArray } from 'react-native-quick-base64'
import { AppConfig } from '@/constants/app-config'

interface WalletAccount {
  address: string
  publicKey: PublicKey
  label?: string
}

interface WalletAuthState {
  isConnected: boolean
  isLoading: boolean
  account: WalletAccount | null
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  signAndSendTransaction: (
    transaction: Transaction | VersionedTransaction,
    minContextSlot?: number
  ) => Promise<TransactionSignature>
}

const WalletAuthContext = createContext<WalletAuthState | null>(null)

const STORAGE_KEYS = {
  AUTH_TOKEN: 'mwa_auth_token',
  BASE64_ADDRESS: 'mwa_base64_address',
  ACCOUNT_LABEL: 'mwa_account_label',
} as const

const APP_IDENTITY = {
  name: 'encryptSIM',
  uri: process.env.EXPO_PUBLIC_APP_URL || 'https://encryptsim.com',
  icon: 'apple-touch-icon.png',
}

export function WalletAuthProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [account, setAccount] = useState<WalletAccount | null>(null)

  useEffect(() => {
    initializeWalletConnection()
  }, [])

  const initializeWalletConnection = async () => {
    setIsLoading(true)
    try {
      if (Platform.OS === 'web') {
        await initializeWebWallet()
      } else {
        await initializeMobileWallet()
      }
    } catch (error) {
      console.error('Failed to initialize wallet connection:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const initializeWebWallet = async () => {
    const wallet = getWebWallet()
    if (wallet?.publicKey) {
      const publicKey = new PublicKey(wallet.publicKey)
      setAccount({
        address: publicKey.toString(),
        publicKey,
        label: wallet.name || 'Web Wallet',
      })
      setIsConnected(true)
    }
  }

  const initializeMobileWallet = async () => {
    try {
      const [cachedAuthToken, cachedBase64Address, cachedLabel] =
        await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN),
          AsyncStorage.getItem(STORAGE_KEYS.BASE64_ADDRESS),
          AsyncStorage.getItem(STORAGE_KEYS.ACCOUNT_LABEL),
        ])

      if (cachedBase64Address && cachedAuthToken) {
        await transact(async (wallet: Web3MobileWallet) => {
          try {
            const authResult = await wallet.authorize({
              identity: APP_IDENTITY,
              chain: AppConfig.clusters[0].id,
              auth_token: cachedAuthToken || undefined,
              sign_in_payload: {
                domain: (process.env.EXPO_PUBLIC_APP_URL ||
                  'https://encryptsim.web.app'
                ).split('https://')[1],
                statement: 'Sign into encryptSIM',
                uri:
                  process.env.EXPO_PUBLIC_APP_URL || 'https://encryptsim.com',
              },
            })

            if (authResult.accounts && authResult.accounts.length > 0) {
              const account = authResult.accounts[0]
              const pubkeyBytes = toByteArray(account.address)
              const publicKey = new PublicKey(pubkeyBytes)

              setAccount({
                address: publicKey.toString(),
                publicKey,
                label: account.label || cachedLabel || 'Mobile Wallet',
              })
              setIsConnected(true)

              await Promise.all([
                AsyncStorage.setItem(
                  STORAGE_KEYS.AUTH_TOKEN,
                  authResult.auth_token
                ),
                AsyncStorage.setItem(
                  STORAGE_KEYS.BASE64_ADDRESS,
                  account.address
                ),
                AsyncStorage.setItem(
                  STORAGE_KEYS.ACCOUNT_LABEL,
                  account.label || 'Mobile Wallet'
                ),
              ])
            }
          } catch {
            await clearCache()
          }
        })
      }
    } catch (error) {
      console.error('Failed to initialize mobile wallet:', error)
      await clearCache()
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

  const connectWebWallet = async () => {
    const wallet = getWebWallet()
    if (!wallet) {
      throw new Error('No Solana wallet found. Please install a wallet.')
    }
    const response = await wallet.connect()
    const publicKey = new PublicKey(response.publicKey || wallet.publicKey)
    setAccount({
      address: publicKey.toString(),
      publicKey,
      label: wallet.name || 'Web Wallet',
    })
    setIsConnected(true)
  }

  const connectMobileWallet = async () => {
    const [cachedAuthToken, cachedBase64Address, cachedLabel] =
      await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN),
        AsyncStorage.getItem(STORAGE_KEYS.BASE64_ADDRESS),
        AsyncStorage.getItem(STORAGE_KEYS.ACCOUNT_LABEL),
      ])
    await transact(async (wallet: Web3MobileWallet) => {
      const authResult = await wallet.authorize({
        identity: APP_IDENTITY,
        chain: AppConfig.clusters[0].id,
        auth_token: cachedAuthToken || undefined,
        sign_in_payload: {
          domain: (process.env.EXPO_PUBLIC_APP_URL ||
            'https://encryptsim.web.app'
          ).split('https://')[1],
          statement: 'Sign into encryptSIM',
          uri: process.env.EXPO_PUBLIC_APP_URL || 'https://encryptsim.com',
        },
      })
      if (!authResult.accounts || authResult.accounts.length === 0) {
        throw new Error('No accounts found in wallet')
      }
      const account = authResult.accounts[0]
      const pubkeyBytes = toByteArray(account.address)
      const publicKey = new PublicKey(pubkeyBytes)
      setAccount({
        address: publicKey.toString(),
        publicKey,
        label: account.label || 'Mobile Wallet',
      })
      setIsConnected(true)
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, authResult.auth_token),
        AsyncStorage.setItem(STORAGE_KEYS.BASE64_ADDRESS, account.address),
        AsyncStorage.setItem(
          STORAGE_KEYS.ACCOUNT_LABEL,
          account.label || 'Mobile Wallet'
        ),
      ])
    })
  }

  const disconnect = async () => {
    try {
      if (Platform.OS === 'web') {
        const wallet = getWebWallet()
        if (wallet?.disconnect) {
          await wallet.disconnect()
        }
      } else {
        const cachedAuthToken = await AsyncStorage.getItem(
          STORAGE_KEYS.AUTH_TOKEN
        )
        if (cachedAuthToken) {
          await transact(async (wallet: Web3MobileWallet) => {
            try {
              await wallet.deauthorize({ auth_token: cachedAuthToken })
            } catch { }
          })
        }
      }
      setAccount(null)
      setIsConnected(false)
      await clearCache()
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

  const signAndSendWebTransaction = async (
    transaction: Transaction | VersionedTransaction
  ): Promise<TransactionSignature> => {
    const wallet = getWebWallet()
    if (!wallet) throw new Error('No web wallet found')
    if (wallet.signAndSendTransaction) {
      return await wallet.signAndSendTransaction(transaction)
    } else if (wallet.signTransaction) {
      const signedTx = await wallet.signTransaction(transaction)
      return await (window as any).solana.connection.sendRawTransaction(signedTx.serialize())
    } else {
      throw new Error('Wallet does not support transaction signing')
    }
  }

  const signAndSendMobileTransaction = async (
    transaction: Transaction | VersionedTransaction,
    minContextSlot?: number
  ): Promise<TransactionSignature> => {
    return await transact(async (wallet: Web3MobileWallet) => {
      const cachedAuthToken = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)

      const authResult = await wallet.authorize({
        identity: APP_IDENTITY,
        chain: AppConfig.clusters[0].id,
        auth_token: cachedAuthToken || undefined,
        sign_in_payload: {
          domain: (process.env.EXPO_PUBLIC_APP_URL ||
            'https://encryptsim.web.app'
          ).split('https://')[1],
          statement: 'Sign into encryptSIM',
          uri: process.env.EXPO_PUBLIC_APP_URL || 'https://encryptsim.com',
        },
      })

      if (!authResult.accounts?.length) {
        throw new Error('No accounts available')
      }

      const signatures = await wallet.signAndSendTransactions({
        transactions: [transaction as VersionedTransaction],
        ...(minContextSlot && { minContextSlot }),
      })

      if (!signatures?.length) {
        throw new Error('No transaction signature returned')
      }

      return signatures[0]
    })
  }

  const clearCache = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN),
        AsyncStorage.removeItem(STORAGE_KEYS.BASE64_ADDRESS),
        AsyncStorage.removeItem(STORAGE_KEYS.ACCOUNT_LABEL),
      ])
    } catch (error) {
      console.error('Failed to clear cache:', error)
    }
  }

  const value: WalletAuthState = {
    isConnected,
    isLoading,
    account,
    connect,
    disconnect,
    signAndSendTransaction,
  }

  return (
    <WalletAuthContext.Provider value={value}>
      {children}
    </WalletAuthContext.Provider>
  )
}

export function useWalletAuth() {
  const context = useContext(WalletAuthContext)
  if (!context) {
    throw new Error('useWalletAuth must be used within WalletAuthProvider')
  }
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
