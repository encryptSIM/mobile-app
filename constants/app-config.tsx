import { PublicKey } from '@solana/web3.js'
import { Cluster } from '@/components/cluster/cluster'
import { ClusterNetwork } from '@/components/cluster/cluster-network'

export class AppConfig {
  static name = 'encryptSIM'
  static apiUrl = process.env.EXPO_PUBLIC_API_URL
  static masterSolAccount = new PublicKey(process.env.EXPO_PUBLIC_MASTER_PUBLIC_KEY ?? "3d7mPXxNSP9p7j2PJQT3dmGDXnNZ2UUEAMDPPdxJtTqH")
  static uri = process.env.EXPO_PUBLIC_APP_URL!
  static domain = process.env.EXPO_PUBLIC_APP_DOMAIN!
  static feePercentage = 1.66
  static clusters: Cluster[] = (() => {
    switch (process.env.EXPO_PUBLIC_ENVIRONMENT) {
      case 'prod':
        return [
          {
            id: 'solana:mainnet-beta',
            name: 'Mainnet',
            endpoint: process.env.EXPO_PUBLIC_RPC_URL!,
            network: ClusterNetwork.Mainnet,
          },
        ];
      case 'staging':
        return [
          {
            id: 'solana:testnet',
            name: 'Testnet',
            endpoint: process.env.EXPO_PUBLIC_RPC_URL!,
            network: ClusterNetwork.Testnet,
          },
        ];

      case 'development':
        return [
          {
            id: 'solana:devnet',
            name: 'Devnet',
            endpoint: process.env.EXPO_PUBLIC_RPC_URL!,
            network: ClusterNetwork.Devnet,
          },
        ];

      default:
        return [
          {
            id: 'solana:devnet',
            name: 'Devnet',
            endpoint: process.env.EXPO_PUBLIC_RPC_URL!,
            network: ClusterNetwork.Devnet,
          },
        ];
    }
  })();

}
