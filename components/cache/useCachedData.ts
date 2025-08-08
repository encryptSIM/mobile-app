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
        console.log(`[useCachedData] Checking local cache for key: ${cacheKey}`);
        const localData = await getFromLocalCache<T>(
          localStorage,
          cacheKey
        );
        if (localData) {
          if (!isExpired(localData)) {
            console.log(`[useCachedData] Local cache hit for key: ${cacheKey}`);
            return localData.data;
          } else {
            console.log(`[useCachedData] Local cache expired for key: ${cacheKey}`);
          }
        } else {
          console.log(`[useCachedData] Local cache miss for key: ${cacheKey}`);
        }
      }

      // 2. Check remote cache
      if (enableRemoteCache && remoteCache) {
        console.log(`[useCachedData] Checking remote cache for key: ${cacheKey}`);
        const remoteData = await remoteCache.get<CachedData<T>>(cacheKey);
        if (remoteData) {
          if (!isExpired(remoteData)) {
            console.log(`[useCachedData] Remote cache hit for key: ${cacheKey}`);
            // Update local cache with remote data
            if (enableLocalCache && localStorage) {
              await setToLocalCache(
                localStorage,
                cacheKey,
                remoteData,
                localTTL
              );
              console.log(`[useCachedData] Updated local cache from remote for key: ${cacheKey}`);
            }
            return remoteData.data;
          } else {
            console.log(`[useCachedData] Remote cache expired for key: ${cacheKey}`);
          }
        } else {
          console.log(`[useCachedData] Remote cache miss for key: ${cacheKey}`);
        }
      }

      // 3. Fetch fresh data
      console.log(`[useCachedData] Fetching fresh data for key: ${cacheKey}`);
      const freshData = await queryFn();

      // 4. Update caches
      const cachedData = wrapWithMetadata(freshData);

      // Update local cache
      if (enableLocalCache && localStorage) {
        await setToLocalCache(localStorage, cacheKey, cachedData, localTTL);
        console.log(`[useCachedData] Set fresh data to local cache for key: ${cacheKey}`);
      }

      // Update remote cache
      if (enableRemoteCache && remoteCache) {
        await remoteCache.set(
          cacheKey,
          wrapWithMetadata(freshData, remoteTTL),
          remoteTTL
        );
        console.log(`[useCachedData] Set fresh data to remote cache for key: ${cacheKey}`);
      }

      return freshData;
    } catch (error) {
      // If all else fails, try to return stale data
      console.error(`[useCachedData] Error during fetch for key: ${cacheKey}`, error);
      if (enableLocalCache && localStorage) {
        const staleData = await getFromLocalCache<T>(localStorage, cacheKey);
        if (staleData) {
          console.warn(
            `[useCachedData] Returning stale data for key: ${cacheKey} due to fetch error:`,
            error
          );
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
    console.log(`[useCachedData] Invalidating cache for key: ${cacheKey}`);
    if (enableLocalCache && localStorage) {
      await localStorage.removeItem(cacheKey);
      console.log(`[useCachedData] Local cache invalidated for key: ${cacheKey}`);
    }
    if (enableRemoteCache && remoteCache) {
      await remoteCache.delete(cacheKey);
      console.log(`[useCachedData] Remote cache invalidated for key: ${cacheKey}`);
    }
  }, [cacheKey, localStorage, remoteCache, enableLocalCache, enableRemoteCache]);

  const preloadCache = useCallback(
    async (data: T) => {
      console.log(`[useCachedData] Preloading cache for key: ${cacheKey}`);
      const cachedData = wrapWithMetadata(data);

      if (enableLocalCache && localStorage) {
        await setToLocalCache(localStorage, cacheKey, cachedData, localTTL);
        console.log(`[useCachedData] Preloaded local cache for key: ${cacheKey}`);
      }
      if (enableRemoteCache && remoteCache) {
        await remoteCache.set(
          cacheKey,
          wrapWithMetadata(data, remoteTTL),
          remoteTTL
        );
        console.log(`[useCachedData] Preloaded remote cache for key: ${cacheKey}`);
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
    if (item) {
      console.log(`[useCachedData] getFromLocalCache: Found item for key: ${key}`);
    } else {
      console.log(`[useCachedData] getFromLocalCache: No item for key: ${key}`);
    }
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.warn(`[useCachedData] getFromLocalCache: Failed to parse item for key: ${key}`, error);
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
    console.log(`[useCachedData] setToLocalCache: Set item for key: ${key}`);
  } catch (error) {
    console.warn(`[useCachedData] setToLocalCache: Failed to set item for key: ${key}`, error);
  }
};
