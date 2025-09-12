import { LAMPORTS_PER_SOL } from '@solana/web3.js'

export function lamportsToSol(balance: number) {
  return Math.round((balance / LAMPORTS_PER_SOL) * 100000) / 100000
}

export function solToLamports(solAmount: number): number {
  return Math.round(solAmount * LAMPORTS_PER_SOL)
}

