import { useQuery } from "@tanstack/react-query";

export const useSolanaPrice = (currencyCode?: string) => useQuery({
  queryKey: ['fetch solana price'],
  queryFn: async () => {
    const currency = currencyCode ? currencyCode.toLowerCase() : 'usd'
    const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=${currency}`);
    const data = await response.json();
    return data.solana[currency]
  }
})
