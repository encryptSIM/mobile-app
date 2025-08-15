import { useUnifiedWallet } from '@/hooks/use-unified-wallet'
import { useEffect } from 'react'

export function useWalletUi() {
  const { 
    connect, 
    signAndSendTransaction, 
    disconnect, 
    selectedAccount,
    connected,
    connecting
  } = useUnifiedWallet()

  // Debug logging
  useEffect(() => {
    console.log('🔍 useWalletUi - selectedAccount changed:', selectedAccount);
    console.log('🔍 useWalletUi - connected:', connected);
  }, [selectedAccount, connected]);

  return {
    account: selectedAccount,
    connect,
    disconnect,
    signAndSendTransaction,
    connected,
    connecting,
    // Note: signMessage and signIn are not available in the unified wallet interface
    // If you need these specific functions, they can be added to the unified wallet hook
  }
}
