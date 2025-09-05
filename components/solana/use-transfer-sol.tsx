import { createTransaction } from '@/components/solana/create-transaction'
import { useConnection } from '@/components/solana/solana-provider'
import {
  PublicKey,
  TransactionSignature
} from '@solana/web3.js'
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
      if (!wallet.account?.publicKey) {
        throw new Error('Wallet not connected')
      }

      const { transaction } = await createTransaction({
        publicKey: wallet.account.publicKey,
        destination: input.destination,
        amount: input.amount,
        connection,
      })

      const signature: TransactionSignature =
        await wallet.signAndSendTransaction(transaction, connection)

      // ✅ Wait for confirmation before returning
      const latestBlockhash = await connection.getLatestBlockhash()
      const confirmation = await connection.confirmTransaction(
        {
          signature,
          blockhash: latestBlockhash.blockhash,
          lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
        },
        'confirmed'
      )

      if (confirmation.value.err) {
        throw new Error(
          `Transaction failed: ${JSON.stringify(confirmation.value.err)}`
        )
      }

      return signature
    },
    onSuccess: async (signature) => {
      if (onSuccess) onSuccess(signature)
      await invalidateBalance()
    },
    onError: (error) => {
      if (onError) onError(error)
    },
  })
}
