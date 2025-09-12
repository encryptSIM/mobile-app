"use client";

import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  TransactionMessage,
  TransactionSignature,
  VersionedTransaction,
} from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useConnection } from "./ConnectionProvider";
import { useWalletAuth } from "./wallet-auth-wrapper";

export function useGetBalance({ address }: { address: PublicKey }) {
  const { connection } = useConnection();

  return useQuery({
    queryKey: ["get-balance", { endpoint: connection.rpcEndpoint, address }],
    queryFn: () => connection.getBalance(address),
  });
}

export function useGetSignatures({ address }: { address: PublicKey }) {
  const { connection } = useConnection();

  return useQuery({
    queryKey: ["get-signatures", { endpoint: connection.rpcEndpoint, address }],
    queryFn: () => connection.getConfirmedSignaturesForAddress2(address),
  });
}

export function useGetTokenAccounts({ address }: { address: PublicKey }) {
  const { connection } = useConnection();

  return useQuery({
    queryKey: [
      "get-token-accounts",
      { endpoint: connection.rpcEndpoint, address },
    ],
    queryFn: async () => {
      const [tokenAccounts, token2022Accounts] = await Promise.all([
        connection.getParsedTokenAccountsByOwner(address, {
          programId: TOKEN_PROGRAM_ID,
        }),
        connection.getParsedTokenAccountsByOwner(address, {
          programId: TOKEN_PROGRAM_ID,
        }),
      ]);
      return [...tokenAccounts.value, ...token2022Accounts.value];
    },
  });
}

export function useGetTokenAccountBalance({ address }: { address: PublicKey }) {
  const { connection } = useConnection();

  return useQuery({
    queryKey: [
      "get-token-account-balance",
      { endpoint: connection.rpcEndpoint, account: address.toString() },
    ],
    queryFn: () => connection.getTokenAccountBalance(address),
  });
}

export function useTransferSol({ address, onError, onSuccess }: { address: PublicKey, onError: (e: any) => void, onSuccess: (signature: any) => void }) {
  const { connection } = useConnection();
  const client = useQueryClient();
  const wallet = useWalletAuth();

  return useMutation({
    mutationKey: [
      "transfer-sol",
      { endpoint: connection.rpcEndpoint, address },
    ],
    mutationFn: async (input: { destination: PublicKey; amount: number }) => {
      console.log('🚀 Starting SOL transfer transaction', {
        from: address.toString(),
        to: input.destination.toString(),
        amount: input.amount,
        amountLamports: input.amount * LAMPORTS_PER_SOL,
        endpoint: connection.rpcEndpoint
      });

      try {
        console.log('📝 Creating transaction...');
        const { transaction, latestBlockhash, minContextSlot } = await createTransaction({
          publicKey: address,
          destination: input.destination,
          amount: input.amount,
          connection,
        });

        console.log('✅ Transaction created successfully', {
          blockhash: latestBlockhash.blockhash,
          lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
          minContextSlot
        });

        console.log('✍️ Signing transaction manually for better error reporting...');

        // Log transaction details before signing for debugging
        console.log('🔍 Transaction inspection before signing:', {
          recentBlockhash: transaction.message.recentBlockhash,
          accountKeys: transaction.message.staticAccountKeys.map(key => key.toString()),
          instructions: transaction.message.compiledInstructions.map(ix => ({
            programIdIndex: ix.programIdIndex,
            accountKeyIndexes: ix.accountKeyIndexes,
            data: Array.from(ix.data)
          })),
          feePayer: transaction.message.staticAccountKeys[0]?.toString(),
          serializedMessage: Buffer.from(transaction.serialize()).toString('base64'),
          messageSize: transaction.serialize().length
        });

        // Sign transaction manually to get more verbose error messages
        const signedTransaction = await wallet.signTransaction(transaction);

        console.log('✅ Transaction signed successfully');

        console.log('📡 Sending raw transaction...');
        const signature: TransactionSignature = await connection.sendRawTransaction(
          signedTransaction.serialize(),
          {
            skipPreflight: false,
            preflightCommitment: 'confirmed',
            maxRetries: 3
          }
        );

        console.log('📡 Transaction sent, signature received', {
          signature,
          explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`
        });

        console.log('⏳ Confirming transaction...');
        const confirmation = await connection.confirmTransaction(
          { signature, ...latestBlockhash },
          "confirmed"
        );

        console.log('✅ Transaction confirmed successfully', {
          signature,
          confirmation: confirmation.value,
          slot: confirmation.context.slot
        });

        return signature;
      } catch (error) {
        console.error('❌ Transaction failed during execution', {
          error: error instanceof Error ? error.message : String(error),
          from: address.toString(),
          to: input.destination.toString(),
          amount: input.amount
        });
        throw error;
      }
    },
    onSuccess: (signature) => {
      console.log('🎉 Transaction mutation completed successfully', {
        signature,
        explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`
      });

      onSuccess(signature);

      console.log('🔄 Invalidating related queries...');
      return Promise.all([
        client.invalidateQueries({
          queryKey: [
            "get-balance",
            { endpoint: connection.rpcEndpoint, address },
          ],
        }),
        client.invalidateQueries({
          queryKey: [
            "get-signatures",
            { endpoint: connection.rpcEndpoint, address },
          ],
        }),
      ]);
    },
    onError: (error) => {
      const errorDetails = {
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
          cause: error.cause
        } : String(error),
        from: address.toString(),
        endpoint: connection.rpcEndpoint,
        timestamp: new Date().toISOString(),
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
        context: {
          rpcEndpoint: connection.rpcEndpoint,
          commitment: connection.commitment || 'finalized'
        }
      };

      console.error('💥 Transaction mutation failed', errorDetails);

      // Log specific error types for better debugging
      if (error instanceof Error) {
        if (error.message.includes('insufficient funds')) {
          console.error('💰 Insufficient funds error detected', {
            address: address.toString(),
            errorMessage: error.message
          });
        } else if (error.message.includes('blockhash')) {
          console.error('⏰ Blockhash/timing related error', {
            errorMessage: error.message,
            suggestion: 'Transaction may have expired or used stale blockhash'
          });
        } else if (error.message.includes('signature')) {
          console.error('✍️ Signature related error', {
            errorMessage: error.message,
            suggestion: 'User may have rejected the transaction or wallet connection issue'
          });
        }
      }

      onError(error);
    },
  });
}

export function useRequestAirdrop({ address }: { address: PublicKey }) {
  const { connection } = useConnection();
  const client = useQueryClient();

  return useMutation({
    mutationKey: ["airdrop", { endpoint: connection.rpcEndpoint, address }],
    mutationFn: async (amount: number = 1) => {
      const [latestBlockhash, signature] = await Promise.all([
        connection.getLatestBlockhash(),
        connection.requestAirdrop(address, amount * LAMPORTS_PER_SOL),
      ]);

      await connection.confirmTransaction(
        { signature, ...latestBlockhash },
        "confirmed"
      );
      return signature;
    },
    onSuccess: (signature) => {
      console.log(signature);
      return Promise.all([
        client.invalidateQueries({
          queryKey: [
            "get-balance",
            { endpoint: connection.rpcEndpoint, address },
          ],
        }),
        client.invalidateQueries({
          queryKey: [
            "get-signatures",
            { endpoint: connection.rpcEndpoint, address },
          ],
        }),
      ]);
    },
  });
}

async function createTransaction({
  publicKey,
  destination,
  amount,
  connection,
}: {
  publicKey: PublicKey;
  destination: PublicKey;
  amount: number;
  connection: Connection;
}): Promise<{
  transaction: VersionedTransaction;
  latestBlockhash: { blockhash: string; lastValidBlockHeight: number };
  minContextSlot: number
}> {
  // Get the latest blockhash and slot to use in our transaction
  const {
    context: { slot: minContextSlot },
    value: latestBlockhash
  } = await connection.getLatestBlockhashAndContext();


  // Create instructions to send, in this case a simple transfer
  const instructions = [
    SystemProgram.transfer({
      fromPubkey: publicKey,
      toPubkey: destination,
      lamports: amount
    }),
  ];

  // Create a new TransactionMessage with version and compile it to legacy
  const messageLegacy = new TransactionMessage({
    payerKey: publicKey,
    recentBlockhash: latestBlockhash.blockhash,
    instructions,
  }).compileToLegacyMessage();

  // Create a new VersionedTransaction which supports legacy and v0
  const transaction = new VersionedTransaction(messageLegacy);

  return {
    transaction,
    latestBlockhash,
    minContextSlot,
  };
}

