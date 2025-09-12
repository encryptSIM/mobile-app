import { createTransaction } from '@/components/solana/create-transaction'
import { useConnection } from '@/components/solana/solana-provider'
import { PublicKey, TransactionSignature } from '@solana/web3.js'
import { useMutation } from '@tanstack/react-query'
import { useWalletAuth } from '../auth/wallet-auth-provider'
import { useGetBalanceInvalidate } from './use-get-balance'

export function useTransferSol({
  address,
  onSuccess,
  onError,
}: {
  address: PublicKey
  onSuccess?: (signature?: string) => void
  onError?: (error: Error) => void
}) {
  const connection = useConnection()
  const wallet = useWalletAuth()
  const invalidateBalance = useGetBalanceInvalidate({ address })

  return useMutation({
    mutationKey: [
      'transfer-sol',
      { endpoint: connection.rpcEndpoint, address: address?.toString() },
    ],
    mutationFn: async (input: { destination: PublicKey; amount: number }) => {
      console.log('DEBUG: Starting SOL transfer mutation...')
      console.log('DEBUG: Transfer input:', {
        destination: input.destination.toString(),
        amount: input.amount,
        fromAddress: wallet.account?.address
      })

      if (!wallet.account?.publicKey) {
        console.error('DEBUG: No wallet connected')
        throw new Error('Wallet not connected')
      }

      if (!wallet.isConnected) {
        console.error('DEBUG: Wallet not in connected state')
        throw new Error('Wallet not connected')
      }

      try {
        console.log('DEBUG: Creating transaction...')
        const { transaction, minContextSlot, latestBlockhash } = await createTransaction({
          publicKey: wallet.account.publicKey,
          destination: input.destination,
          amount: input.amount,
          connection,
        })

        console.log('DEBUG: Transaction created:', {
          minContextSlot,
          blockhash: latestBlockhash.blockhash,
          lastValidBlockHeight: latestBlockhash.lastValidBlockHeight
        })

        console.log('DEBUG: Signing and sending transaction...')
        const signature: TransactionSignature = await wallet.signAndSendTransaction(
          transaction,
          minContextSlot
        )

        console.log('DEBUG: Transaction signature received:', signature)

        console.log('DEBUG: Waiting for confirmation...')
        await connection.confirmTransaction(
          { signature, ...latestBlockhash },
          'confirmed'
        )

        console.log('DEBUG: Transaction confirmed successfully')
        return signature
      } catch (error) {
        console.error('DEBUG: Transaction failed:', error)
        throw error
      }
    },
    onSuccess: async (signature) => {
      console.log('DEBUG: Transfer mutation succeeded:', signature)
      if (onSuccess) onSuccess(signature)
      try {
        await invalidateBalance()
        console.log('DEBUG: Balance cache invalidated')
      } catch (error) {
        console.error('DEBUG: Failed to invalidate balance cache:', error)
      }
    },
    onError: (error) => {
      console.error('DEBUG: Transfer mutation failed:', error)
      if (onError) onError(error as Error)
    },
  })
}
