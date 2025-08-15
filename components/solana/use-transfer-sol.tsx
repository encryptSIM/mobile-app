import { PublicKey, TransactionSignature } from '@solana/web3.js'
import { useConnection } from '@/components/solana/solana-provider'
import { useMutation } from '@tanstack/react-query'
import { useWalletUi } from '@/components/solana/use-wallet-ui'
import { createTransaction } from '@/components/solana/create-transaction'
import { useGetBalanceInvalidate } from './use-get-balance'

export function useTransferSol({
  address,
  onSuccess,
  onError
}: {
  address: PublicKey,
  onSuccess?: (signature?: string) => void,
  onError?: (error: Error) => void
}) {
  const connection = useConnection()
  const { signAndSendTransaction } = useWalletUi()
  const invalidateBalance = useGetBalanceInvalidate({ address })

  return useMutation({
    mutationKey: ['transfer-sol', { endpoint: connection.rpcEndpoint, address: address?.toString() }],
    mutationFn: async (input: { destination: PublicKey; amount: number }) => {
      if (!address) {
        throw new Error('Wallet address is required');
      }

      let signature: TransactionSignature = ''
      const { transaction, latestBlockhash, minContextSlot } = await createTransaction({
        publicKey: address,
        destination: input.destination,
        amount: input.amount,
        connection,
      })

      // Sign and send transaction using the unified wallet interface
      signature = await signAndSendTransaction(transaction, connection)

      console.log('Transaction signature:', signature)
      return signature
    },
    onSuccess: async (signature) => {
      if (onSuccess) onSuccess(signature)
      console.log('Transaction successful:', signature)
      await invalidateBalance()
    },
    onError: (error) => {
      if (onError) onError(error)
      console.error(`Transaction failed! ${error}`)
    },
  })
}
