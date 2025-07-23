import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { useConnection } from '../solana/solana-provider'
import { Cluster } from '@/components/cluster/cluster'
import { Text } from '../Themed'

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
