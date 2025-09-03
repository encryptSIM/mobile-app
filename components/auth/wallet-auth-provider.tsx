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
    connection: Connection
  ) => Promise<TransactionSignature>
}

const WalletAuthContext = createContext<WalletAuthState | null>(null)

const STORAGE_KEYS = {
  WALLET_CONNECTED: 'wallet_connected',
  WALLET_ADDRESS: 'wallet_address',
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
    try {
      setIsLoading(true)
      const wasConnected = await AsyncStorage.getItem(
        STORAGE_KEYS.WALLET_CONNECTED
      )
      const savedAddress = await AsyncStorage.getItem(
        STORAGE_KEYS.WALLET_ADDRESS
      )
      if (wasConnected === 'true' && savedAddress) {
        await attemptReconnection(savedAddress)
      }
    } catch (error) {
      console.error('Failed to initialize wallet connection:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const attemptReconnection = async (savedAddress: string) => {
    try {
      if (Platform.OS === 'web') {
        const wallet = getWebWallet()
        if (wallet && wallet.isConnected && wallet.publicKey) {
          const publicKey = new PublicKey(wallet.publicKey)
          if (publicKey.toString() === savedAddress) {
            setAccount({
              address: savedAddress,
              publicKey,
              label: wallet.name || 'Web Wallet',
            })
            setIsConnected(true)
            return
          }
        }
      }
      await clearSavedConnection()
    } catch (error) {
      console.error('Reconnection failed:', error)
      await clearSavedConnection()
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
      throw new Error(
        'No Solana wallet found. Please install Phantom, Solflare, or Backpack.'
      )
    }
    const response = await wallet.connect()
    let publicKey: PublicKey
    if (response?.publicKey) {
      publicKey = new PublicKey(response.publicKey)
    } else if (wallet.publicKey) {
      publicKey = new PublicKey(wallet.publicKey)
    } else {
      throw new Error('Failed to get public key from wallet')
    }
    const newAccount: WalletAccount = {
      address: publicKey.toString(),
      publicKey,
      label: wallet.name || 'Web Wallet',
    }
    setAccount(newAccount)
    setIsConnected(true)
    await saveConnection(newAccount.address)
  }

  const connectMobileWallet = async () => {
    await transact(async (wallet: Web3MobileWallet) => {
      const authResult = await wallet.authorize({
        identity: APP_IDENTITY,
        chain: 'solana:devnet',
      })
      if (!authResult.accounts || authResult.accounts.length === 0) {
        throw new Error('No accounts found in wallet')
      }
      const rawAddress: any = authResult.accounts[0].address
      let address: string
      if (typeof rawAddress === 'string') {
        try {
          address = new PublicKey(rawAddress).toString()
        } catch {
          const bytes = Uint8Array.from(atob(rawAddress), (c) =>
            c.charCodeAt(0)
          )
          address = new PublicKey(bytes).toString()
        }
      } else if (rawAddress instanceof Uint8Array) {
        address = new PublicKey(rawAddress).toString()
      } else {
        throw new Error('Invalid address format from wallet')
      }
      const publicKey = new PublicKey(address)
      const newAccount: WalletAccount = {
        address,
        publicKey,
        label: authResult.accounts[0].label || 'Mobile Wallet',
      }
      setAccount(newAccount)
      setIsConnected(true)
      await saveConnection(newAccount.address)
    })
  }

  const disconnect = async () => {
    try {
      if (Platform.OS === 'web') {
        const wallet = getWebWallet()
        if (wallet?.disconnect) {
          await wallet.disconnect()
        }
      }
      setAccount(null)
      setIsConnected(false)
      await clearSavedConnection()
    } catch (error) {
      console.error('Disconnect failed:', error)
    }
  }

  const signAndSendTransaction = async (
    transaction: Transaction | VersionedTransaction,
    connection: Connection
  ): Promise<TransactionSignature> => {
    if (!account) {
      throw new Error('No wallet connected')
    }
    const { blockhash, lastValidBlockHeight } =
      await connection.getLatestBlockhash()
    if (transaction instanceof Transaction) {
      transaction.recentBlockhash = blockhash
      transaction.feePayer = account.publicKey
    }
    if (Platform.OS === 'web') {
      const wallet = getWebWallet()
      if (!wallet) throw new Error('No web wallet found')
      let signedTx: Transaction | VersionedTransaction
      if (wallet.signTransaction) {
        if (transaction instanceof Transaction) {
          signedTx = await wallet.signTransaction(transaction)
        } else {
          throw new Error(
            'This wallet does not support VersionedTransaction signing'
          )
        }
      } else if (wallet.signAndSendTransaction) {
        signedTx = await wallet.signAndSendTransaction(transaction)
      } else {
        throw new Error('Wallet does not support transaction signing')
      }
      const rawTx = signedTx.serialize()
      const signature = await connection.sendRawTransaction(rawTx)
      await connection.confirmTransaction(
        {
          blockhash,
          lastValidBlockHeight,
          signature,
        },
        'confirmed'
      )
      return signature
    } else {
      return await transact(async (mobileWallet: Web3MobileWallet) => {
        const signatures = await mobileWallet.signAndSendTransactions({
          transactions: [transaction],
        })
        if (!signatures || signatures.length === 0) {
          throw new Error('No signature returned from mobile wallet')
        }
        const signature = signatures[0]
        await connection.confirmTransaction(
          {
            blockhash,
            lastValidBlockHeight,
            signature,
          },
          'confirmed'
        )
        return signature
      })
    }
  }

  const saveConnection = async (address: string) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.WALLET_CONNECTED, 'true')
      await AsyncStorage.setItem(STORAGE_KEYS.WALLET_ADDRESS, address)
    } catch (error) {
      console.error('Failed to save connection:', error)
    }
  }

  const clearSavedConnection = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.WALLET_CONNECTED)
      await AsyncStorage.removeItem(STORAGE_KEYS.WALLET_ADDRESS)
    } catch (error) {
      console.error('Failed to clear saved connection:', error)
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
