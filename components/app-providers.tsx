import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PropsWithChildren } from 'react'
import { ClusterProvider } from './cluster/cluster-provider'
import { SolanaProvider } from '@/components/solana/solana-provider'
import { AppTheme } from '@/components/app-theme'
import { AuthProvider } from '@/components/auth/auth-provider'
import { PaperProvider } from 'react-native-paper'
import { ThemeProp } from 'react-native-paper/lib/typescript/types'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

const queryClient = new QueryClient()
const theme: ThemeProp = {
  roundness: 30,
  colors: {
    primary: '#32D583',
    onPrimary: 'red',
    primaryContainer: 'red',
    onPrimaryContainer: 'red',

    secondary: 'red',
    onSecondary: 'red',
    secondaryContainer: 'red',
    onSecondaryContainer: 'red',

    onTertiary: 'red',
    tertiary: 'red',
    tertiaryContainer: 'red',
    onTertiaryContainer: 'red',

    surface: 'red',
    onSurface: 'red',
    surfaceVariant: 'red',

    background: '#202939',
    onBackground: '#202939',

    outline: '#202939',
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
                <AuthProvider>{children}</AuthProvider>
              </PaperProvider>
            </GestureHandlerRootView>
          </SolanaProvider>
        </ClusterProvider>
      </QueryClientProvider>
    </AppTheme>
  )
}
