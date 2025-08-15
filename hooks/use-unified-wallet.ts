import { useMemo, useEffect } from 'react';
import { shouldUseWebWalletAdapter, shouldUseMobileWalletAdapter } from '@/utils/environment';
import { useMobileWallet } from '@/hooks/use-mobile-wallet';
import { useSimpleWebWallet } from '@/hooks/use-simple-web-wallet';

export type { AuthorizedWallet, Account } from '@/hooks/use-mobile-wallet';
export type { SimpleWebAuthorizedWallet, SimpleWebWalletAccount } from '@/hooks/use-simple-web-wallet';

export const useUnifiedWallet = () => {
  const mobileWallet = useMobileWallet();
  const simpleWebWallet = useSimpleWebWallet();

  const shouldUseWeb = shouldUseWebWalletAdapter();
  const shouldUseMobile = shouldUseMobileWalletAdapter();

  const wallet = useMemo(() => {
    if (shouldUseWeb) {
      console.log('🌐 Using simple web wallet adapter');
      return simpleWebWallet;
    } else if (shouldUseMobile) {
      console.log('📱 Using mobile wallet adapter');
      return mobileWallet;
    } else {
      console.log('⚠️ Environment not detected, defaulting to mobile wallet adapter');
      return mobileWallet;
    }
  }, [shouldUseWeb, shouldUseMobile, simpleWebWallet, mobileWallet]);

  // Debug logging
  useEffect(() => {
    console.log('🔍 useUnifiedWallet - wallet state:', {
      shouldUseWeb,
      shouldUseMobile,
      selectedAccount: wallet.selectedAccount,
      connected: wallet.connected,
      connecting: wallet.connecting
    });
  }, [shouldUseWeb, shouldUseMobile, wallet.selectedAccount, wallet.connected, wallet.connecting]);

  return wallet;
}; 
