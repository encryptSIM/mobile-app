import { Cluster } from '@/components/cluster/cluster'
import { useConnection } from '@/components/solana/solana-provider'
import { ellipsify } from '@/utils/ellipsify'
import { useQuery } from '@tanstack/react-query'
import React from 'react'
import { Text } from 'react-native'

export function ClusterUiGenesisHash({ selectedCluster }: { selectedCluster: Cluster }) {
  const connection = useConnection()
  const query = useQuery({
    queryKey: ['get-genesis-hash', { selectedCluster }],
    queryFn: () => connection.getGenesisHash(),
  })

  return <Text>Genesis Hash: {query.isLoading ? 'Loading...' : `${ellipsify(query.data, 8)}`}</Text>
}
