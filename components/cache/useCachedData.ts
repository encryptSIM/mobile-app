import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import {
  CacheStorage,
  RemoteCache,
  CacheConfig,
  CachedData,
} from './types';
import {
  isExpired,
  wrapWithMetadata,
  generateCacheKey,
} from './utils';

interface UseCachedDataOptions<T, E = Error> extends CacheConfig {
  queryKey: string | (string | number | boolean)[];
  queryFn: () => Promise<T>;
  localStorage?: CacheStorage;
  remoteCache?: RemoteCache;
  queryOptions?: Omit<
    UseQueryOptions<T, E>,
    'queryKey' | 'queryFn' | 'staleTime' | 'gcTime'
  >;
}

export const useCachedData = <T, E = Error>({
  queryKey,
  queryFn,
  localStorage,
  remoteCache,
  localTTL = 5 * 60 * 1000, // 5 minutes default
  remoteTTL = 30 * 60 * 1000, // 30 minutes default
  enableLocalCache = true,
  enableRemoteCache = true,
  staleTime = 5 * 60 * 1000,
  cacheTime = 10 * 60 * 1000, // Keep for backwards compatibility
  queryOptions = {},
}: UseCachedDataOptions<T, E>) => {
  // Generate consistent cache key
  const cacheKey = useMemo(() => {
    if (Array.isArray(queryKey)) {
      return generateCacheKey(queryKey[0] as string, {
        params: queryKey.slice(1),
      });
    }
    return queryKey;
  }, [queryKey]);

  // Enhanced query function with caching logic
  const enhancedQueryFn = useCallback(async (): Promise<T> => {
    try {
      // 1. Check local cache first
      if (enableLocalCache && localStorage) {
        const localData = await getFromLocalCache<T>(
          localStorage,
          cacheKey
        );
        if (localData && !isExpired(localData)) {
          return localData.data;
        }
      }

      // 2. Check remote cache
      if (enableRemoteCache && remoteCache) {
        const remoteData = await remoteCache.get<CachedData<T>>(cacheKey);
        if (remoteData && !isExpired(remoteData)) {
          // Update local cache with remote data
          if (enableLocalCache && localStorage) {
            await setToLocalCache(
              localStorage,
              cacheKey,
              remoteData,
              localTTL
            );
          }
          return remoteData.data;
        }
      }

      // 3. Fetch fresh data
      const freshData = await queryFn();

      // 4. Update caches
      const cachedData = wrapWithMetadata(freshData);

      // Update local cache
      if (enableLocalCache && localStorage) {
        await setToLocalCache(localStorage, cacheKey, cachedData, localTTL);
      }

      // Update remote cache
      if (enableRemoteCache && remoteCache) {
        await remoteCache.set(
          cacheKey,
          wrapWithMetadata(freshData, remoteTTL),
          remoteTTL
        );
      }

      return freshData;
    } catch (error) {
      // If all else fails, try to return stale data
      if (enableLocalCache && localStorage) {
        const staleData = await getFromLocalCache<T>(localStorage, cacheKey);
        if (staleData) {
          console.warn('Returning stale data due to fetch error:', error);
          return staleData.data;
        }
      }
      throw error;
    }
  }, [
    cacheKey,
    queryFn,
    localStorage,
    remoteCache,
    enableLocalCache,
    enableRemoteCache,
    localTTL,
    remoteTTL,
  ]);

  // Cache management functions
  const invalidateCache = useCallback(async () => {
    if (enableLocalCache && localStorage) {
      await localStorage.removeItem(cacheKey);
    }
    if (enableRemoteCache && remoteCache) {
      await remoteCache.delete(cacheKey);
    }
  }, [cacheKey, localStorage, remoteCache, enableLocalCache, enableRemoteCache]);

  const preloadCache = useCallback(
    async (data: T) => {
      const cachedData = wrapWithMetadata(data);

      if (enableLocalCache && localStorage) {
        await setToLocalCache(localStorage, cacheKey, cachedData, localTTL);
      }
      if (enableRemoteCache && remoteCache) {
        await remoteCache.set(
          cacheKey,
          wrapWithMetadata(data, remoteTTL),
          remoteTTL
        );
      }
    },
    [
      cacheKey,
      localStorage,
      remoteCache,
      enableLocalCache,
      enableRemoteCache,
      localTTL,
      remoteTTL,
    ]
  );

  // Use React Query with enhanced query function
  const query = useQuery<T, E>({
    queryKey: Array.isArray(queryKey) ? queryKey : [queryKey],
    queryFn: enhancedQueryFn,
    staleTime,
    gcTime: cacheTime, // Use gcTime instead of cacheTime
    ...queryOptions,
  });

  return {
    ...query,
    invalidateCache,
    preloadCache,
    cacheKey,
  };
};

// Helper functions
const getFromLocalCache = async <T>(
  storage: CacheStorage,
  key: string
): Promise<CachedData<T> | null> => {
  try {
    const item = await storage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch {
    return null;
  }
};

const setToLocalCache = async <T>(
  storage: CacheStorage,
  key: string,
  data: CachedData<T>,
  ttl: number
): Promise<void> => {
  try {
    const dataWithTTL = { ...data, ttl };
    await storage.setItem(key, JSON.stringify(dataWithTTL));
  } catch (error) {
    console.warn('Failed to set local cache:', error);
  }
};
