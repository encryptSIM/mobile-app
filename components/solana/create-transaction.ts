import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  TransactionMessage,
  VersionedTransaction,
} from '@solana/web3.js'

export async function createTransaction({
  publicKey,
  destination,
  amount,
  connection,
}: {
  publicKey: PublicKey
  destination: PublicKey
  amount: number // in SOL
  connection: Connection
}): Promise<{ transaction: VersionedTransaction }> {
  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash('finalized')

  const instructions = [
    SystemProgram.transfer({
      fromPubkey: publicKey,
      toPubkey: destination,
      lamports: Math.round(amount * LAMPORTS_PER_SOL),
    }),
  ]

  const message = new TransactionMessage({
    payerKey: publicKey, // 👈 must be wallet.account.publicKey
    recentBlockhash: blockhash,
    instructions,
  }).compileToV0Message()

  const transaction = new VersionedTransaction(message)

  return { transaction }
}
