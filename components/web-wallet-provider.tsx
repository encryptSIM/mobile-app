import React from 'react';
import { shouldUseWebWalletAdapter } from '@/utils/environment';

interface WebWalletProviderProps {
  children: React.ReactNode;
}

export const WebWalletProvider: React.FC<WebWalletProviderProps> = ({ children }) => {
  // Only render web wallet provider if we should use web wallet adapter
  if (!shouldUseWebWalletAdapter()) {
    return <>{children}</>;
  }

  // For now, just return children without the web wallet provider
  // This will prevent the Node.js module errors while we work on a solution
  console.log('🌐 Web wallet provider detected, but not yet implemented for web compatibility');

  return <>{children}</>;
}; 
