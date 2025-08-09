import { PublicKey, TransactionSignature } from '@solana/web3.js'
import { useConnection } from '@/components/solana/solana-provider'
import { useMutation } from '@tanstack/react-query'
import { useWalletUi } from '@/components/solana/use-wallet-ui'
import { createTransaction } from '@/components/solana/create-transaction'
import { useGetBalanceInvalidate } from './use-get-balance'

export function useTransferSol({ address, onSuccess, onError }: { address: PublicKey, onSuccess?: (signature?: string) => void, onError?: (error: Error) => void }) {
  const connection = useConnection()
  const { signAndSendTransaction } = useWalletUi()
  const invalidateBalance = useGetBalanceInvalidate({ address })

  return useMutation({
    mutationKey: ['transfer-sol', { endpoint: connection.rpcEndpoint, address }],
    mutationFn: async (input: { destination: PublicKey; amount: number }) => {
      let signature: TransactionSignature = ''
      const { transaction, latestBlockhash, minContextSlot } = await createTransaction({
        publicKey: address,
        destination: input.destination,
        amount: input.amount,
        connection,
      })

      // Send transaction and await for signature
      signature = await signAndSendTransaction(transaction, minContextSlot)

      // Send transaction and await for signature
      await connection.confirmTransaction({ signature, ...latestBlockhash }, 'confirmed')

      console.log(signature)
      return signature
    },
    onSuccess: async (signature) => {
      if (onSuccess) onSuccess(signature)
      console.log(signature)
      await invalidateBalance()
    },
    onError: (error) => {
      if (onError) onError(error)
      console.error(`Transaction failed! ${error}`)
    },
  })
}
