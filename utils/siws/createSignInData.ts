import type { SolanaSignInInput } from '@solana/wallet-standard-features';
import { AppConfig } from '@/constants/app-config';

export const createSignInData = async (): Promise<SolanaSignInInput> => {
  const now: Date = new Date();
  const uri = AppConfig.uri;
  const domain = new URL(uri).host;

  // Convert the Date object to a string
  const currentDateTime = now.toISOString();

  // Generate a random nonce for security
  const nonce = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

  const signInData: SolanaSignInInput = {
    domain,
    statement: "Sign in to encryptSIM to access your account and manage your eSIM services securely.",
    uri,
    version: "1",
    nonce,
    chainId: AppConfig.clusters[0].id,
    issuedAt: currentDateTime,
    expirationTime: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
    resources: [uri],
  };

  return signInData;
};
