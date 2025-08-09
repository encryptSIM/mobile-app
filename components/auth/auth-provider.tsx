import { createContext, type PropsWithChildren, use, useMemo } from 'react'
import { useMobileWallet } from '@/components/solana/use-mobile-wallet'
import { AppConfig } from '@/constants/app-config'
import { Account, useAuthorization } from '@/components/solana/use-authorization'
import { useMutation } from '@tanstack/react-query'
import { useAsyncStorage } from '@/hooks/asyn-storage-hook'

export interface AuthState {
  isAuthenticated: boolean
  isLoading: boolean
  deviceToken: string | null;
  deviceTokenLoading: boolean;
  setDeviceToken: (value: string) => Promise<void>;
  signIn: () => Promise<Account>
  signOut: () => Promise<void>
}

const Context = createContext<AuthState>({} as AuthState)

export function useAuth() {
  const value = use(Context)
  if (!value) {
    throw new Error('useAuth must be wrapped in a <AuthProvider />')
  }

  return value
}

function useSignInMutation() {
  const { signIn } = useMobileWallet()

  return useMutation({
    mutationFn: async () =>
      await signIn({
        uri: AppConfig.uri,
        domain: AppConfig.domain,
        statement: "Sign into to get your eSIM now!"
      }),
  })
}

export function AuthProvider({ children }: PropsWithChildren) {
  const { disconnect } = useMobileWallet()
  const { accounts, isLoading } = useAuthorization()
  const signInMutation = useSignInMutation()

  const {
    value: deviceToken,
    loading: deviceTokenLoading,
    setValue: setDeviceToken,
  } = useAsyncStorage<string>("deviceToken");

  const value: AuthState = useMemo(
    () => ({
      signIn: async () => await signInMutation.mutateAsync(),
      signOut: async () => await disconnect(),
      setDeviceToken,
      deviceTokenLoading,
      deviceToken,
      isAuthenticated: (accounts?.length ?? 0) > 0,
      isLoading: signInMutation.isPending || isLoading,
    }),
    [accounts, disconnect, signInMutation, isLoading],
  )

  return <Context value={value}>{children}</Context>
}
