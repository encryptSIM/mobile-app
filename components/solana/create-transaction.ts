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
  amount: number
  connection: Connection
}): Promise<{
  transaction: VersionedTransaction
  latestBlockhash: { blockhash: string; lastValidBlockHeight: number }
  minContextSlot: number
}> {
  console.log('DEBUG: Creating transaction with params:', {
    from: publicKey.toString(),
    to: destination.toString(),
    amount: `${amount} SOL`,
    lamports: Math.round(amount * LAMPORTS_PER_SOL)
  })

  try {
    console.log('DEBUG: Getting latest blockhash and context...')
    const {
      context: { slot: minContextSlot },
      value: latestBlockhash,
    } = await connection.getLatestBlockhashAndContext()

    console.log('DEBUG: Blockhash info:', {
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      minContextSlot
    })

    console.log('DEBUG: Creating transfer instruction...')
    const lamports = Math.round(amount * LAMPORTS_PER_SOL)
    const instructions = [
      SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: destination,
        lamports,
      }),
    ]

    console.log('DEBUG: Creating transaction message...')
    const message = new TransactionMessage({
      payerKey: publicKey,
      recentBlockhash: latestBlockhash.blockhash,
      instructions,
    }).compileToLegacyMessage()

    console.log('DEBUG: Creating versioned transaction...')
    const transaction = new VersionedTransaction(message)

    console.log('DEBUG: Transaction created successfully')
    return {
      transaction,
      latestBlockhash,
      minContextSlot,
    }
  } catch (error) {
    console.error('DEBUG: Failed to create transaction:', error)
    throw error
  }
}
