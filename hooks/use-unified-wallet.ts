import { useMemo } from 'react';
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
      return simpleWebWallet;
    } else if (shouldUseMobile) {
      return mobileWallet;
    } else {
      return mobileWallet;
    }
  }, [shouldUseWeb, shouldUseMobile, simpleWebWallet, mobileWallet]);

  return wallet;
}; 
