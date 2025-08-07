import { Cluster } from '@/components/cluster/cluster'
import { useQuery } from '@tanstack/react-query'
import React from 'react'
import { Text } from 'react-native'
import { useConnection } from '../solana/solana-provider'

export function ClusterUiVersion({ selectedCluster }: { selectedCluster: Cluster }) {
  const connection = useConnection()
  const query = useQuery({
    queryKey: ['get-version', { selectedCluster }],
    queryFn: () =>
      connection.getVersion().then((version) => {
        return {
          core: version['solana-core'],
          features: version['feature-set'],
        }
      }),
  })

  return <Text>Version: {query.isLoading ? 'Loading...' : `${query.data?.core} (${query.data?.features})`}</Text>
}
