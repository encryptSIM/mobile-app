import { clusterApiUrl, PublicKey } from '@solana/web3.js'
import { Cluster } from '@/components/cluster/cluster'
import { ClusterNetwork } from '@/components/cluster/cluster-network'

export class AppConfig {
  static name = 'encryptSIM'
  static apiUrl = process.env.EXPO_PUBLIC_API_URL
  static masterSolAccount = new PublicKey(process.env.EXP0_PUBLIC_MASTER_PUBLIC_KEY ?? "3d7mPXxNSP9p7j2PJQT3dmGDXnNZ2UUEAMDPPdxJtTqH")
  static uri = process.env.EXPO_PUBLIC_APP_URL!
  static domain = process.env.EXPO_PUBLIC_APP_DOMAIN!
  static feePercentage = 1.66
  static clusters: Cluster[] = (() => {
    switch (process.env.EXPO_PUBLIC_ENVIRONMENT) {
      case 'prod':
        console.log("USING PROD CLUSTERS")
        return [
          {
            id: 'solana:testnet',
            name: 'Testnet',
            endpoint: clusterApiUrl('testnet'),
            network: ClusterNetwork.Testnet,
          },
          {
            id: 'solana:mainnet-beta',
            name: 'Mainnet',
            endpoint: clusterApiUrl('mainnet-beta'),
            network: ClusterNetwork.Mainnet,
          },
        ];

      case 'development':
        console.log("USING DEV CLUSTERS")
        return [
          {
            id: 'solana:devnet',
            name: 'Devnet',
            endpoint: clusterApiUrl('devnet'),
            network: ClusterNetwork.Devnet,
          },
        ];

      default:
        console.log("USING STAGING CLUSTERS")
        return [
          {
            id: 'solana:devnet',
            name: 'Devnet',
            endpoint: clusterApiUrl('devnet'),
            network: ClusterNetwork.Devnet,
          },
        ];
    }
  })();

}
