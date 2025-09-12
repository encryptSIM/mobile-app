import type { SolanaSignInInput, SolanaSignInOutput } from '@solana/wallet-standard-features';
import { verifySignIn } from '@solana/wallet-standard-util';

export const verifySolanaSignIn = (input: SolanaSignInInput, output: SolanaSignInOutput): boolean => {
  try {
    // Verify the sign-in output against the generated input
    const isValid = verifySignIn(input, output);

    if (!isValid) {
      console.error('SIWS verification failed: Invalid signature or data mismatch');
      return false;
    }

    // Additional validation checks
    const now = new Date();
    const issuedAt = new Date(input.issuedAt!);
    const expirationTime = input.expirationTime ? new Date(input.expirationTime) : null;

    // Check if the sign-in data is not from the future
    if (issuedAt > now) {
      console.error('SIWS verification failed: Sign-in data issued in the future');
      return false;
    }

    // Check if the sign-in data has not expired
    if (expirationTime && expirationTime < now) {
      console.error('SIWS verification failed: Sign-in data has expired');
      return false;
    }

    return true;
  } catch (error) {
    console.error('SIWS verification error:', error);
    return false;
  }
};

export const createSIWSPayload = (input: SolanaSignInInput, output: SolanaSignInOutput) => {
  return JSON.stringify({ input, output });
};

export const parseSIWSPayload = (payload: string): { input: SolanaSignInInput; output: SolanaSignInOutput } => {
  return JSON.parse(payload);
};

