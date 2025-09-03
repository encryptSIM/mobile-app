import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PropsWithChildren } from 'react'
import { ClusterProvider } from './cluster/cluster-provider'
import { SolanaProvider } from '@/components/solana/solana-provider'
import { AppTheme } from '@/components/app-theme'
import { PaperProvider } from 'react-native-paper'
import { ThemeProp } from 'react-native-paper/lib/typescript/types'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { Provider } from '@/hooks/use-provider'
import { WebWalletProvider } from '@/components/web-wallet-provider'
import { WalletAuthProvider } from './auth/wallet-auth-provider'

const queryClient = new QueryClient()

export const brandGreen = "#32D583"
export const card = "#202939"
export const background = "#111926"

const theme: ThemeProp = {
  roundness: 30,
  colors: {
    primary: brandGreen,
    onPrimary: '#000000', // Black text on green buttons
    primaryContainer: card,
    onPrimaryContainer: brandGreen,
    inversePrimary: '#1A5D3A', // Darker green for inverse contexts

    secondary: '#878787', // Gray text color visible in your UI
    onSecondary: '#000000',
    secondaryContainer: card,
    onSecondaryContainer: '#FFFFFF',

    tertiary: '#4A90E2', // Blue accent for variety
    onTertiary: '#FFFFFF',
    tertiaryContainer: '#1E3A5F',
    onTertiaryContainer: '#B3D4FF',

    surface: card, // Card backgrounds
    inverseSurface: '#FFFFFF',
    onSurface: '#FFFFFF', // White text on dark surfaces
    onSurfaceDisabled: 'white',
    inverseOnSurface: '#000000',

    surfaceVariant: '#2A3441', // Slightly lighter than card for variants
    onSurfaceVariant: '#C4C7C5',

    outlineVariant: '#3A4450', // Subtle borders

    background: background, // Main app background
    onBackground: '#FFFFFF', // White text on dark background

    outline: '#4A5568', // Border colors

    error: '#FF5252',
    onError: '#FFFFFF',
    onErrorContainer: '#FFEBEE',
    backdrop: 'rgba(0, 0, 0, 0.5)', // Modal backdrop
  }
}

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <AppTheme>
      <QueryClientProvider client={queryClient}>
        <ClusterProvider>
          <SolanaProvider>
            <GestureHandlerRootView>
              <PaperProvider theme={theme}>
                <WebWalletProvider>
                  <WalletAuthProvider>
                    <Provider>
                      {children}
                    </Provider>
                  </WalletAuthProvider>
                </WebWalletProvider>
              </PaperProvider>
            </GestureHandlerRootView>
          </SolanaProvider>
        </ClusterProvider>
      </QueryClientProvider>
    </AppTheme>
  )
}
