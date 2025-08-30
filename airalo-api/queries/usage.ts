import { fetchClient } from '@/api/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery } from '@tanstack/react-query';
import * as airaloApi from '../api';

interface CacheEntry {
  data: airaloApi.Usage;
  timestamp: number;
  retryAfter?: number;
}

interface UseMultiUsageOptions {
  useFakeData?: boolean;
}

const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds
const CACHE_KEY_PREFIX = 'sim_usage_';

export const useMultiUsage = (
  iccids: string[],
  options: UseMultiUsageOptions = {}
) => {
  const { useFakeData = process.env.EXPO_PUBLIC_ENVIRONMENT !== 'prod' } = options;

  return useQuery({
    queryKey: ['multi-usage', ...iccids, useFakeData],
    queryFn: async () => {
      if (useFakeData) {
        return generateFakeUsageData(iccids);
      }

      const now = Date.now();
      const results: Record<string, airaloApi.Usage> = {};
      const iccidsToFetch: string[] = [];

      // First, check AsyncStorage cache for all ICCIDs
      const cachedData = await Promise.all(
        iccids.map(async (iccid) => {
          const data = await getCachedUsageFromStorage(iccid);
          return { iccid, data };
        })
      );

      // Determine which ICCIDs need fresh data
      cachedData.forEach(({ iccid, data }) => {
        if (data && now - data.timestamp < CACHE_DURATION) {
          // Use cached data if it's still valid
          results[iccid] = data.data;
        } else if (data?.retryAfter) {
          const rateLimitExpiry = data.timestamp + (data.retryAfter * 1000);
          if (now < rateLimitExpiry) {
            // Still rate limited, use cached data
            results[iccid] = data.data;
          } else {
            // Rate limit expired, need to fetch
            iccidsToFetch.push(iccid);
          }
        } else {
          // No valid cache, need to fetch
          iccidsToFetch.push(iccid);
        }
      });

      // If all data is cached and valid, return early
      if (iccidsToFetch.length === 0) {
        return results;
      }

      // Fetch fresh data for ICCIDs that need it
      const fetchPromises = iccidsToFetch.map(async (iccid) => {
        try {
          const response = await airaloApi.airaloFetchClient.GET('/v2/sims/{sim_iccid}/usage', {
            params: {
              path: {
                sim_iccid: iccid
              }
            }
          });

          const usageData: airaloApi.Usage = response.data?.data!;

          // Cache the fresh data
          await cacheUsageInStorage(iccid, {
            data: usageData,
            timestamp: now
          });

          // Also cache it in your backend if needed
          try {
            await cacheUsage(iccid, usageData);
          } catch (backendError) {
            console.warn(`Failed to cache usage for ${iccid} in backend:`, backendError);
          }

          return { iccid, data: usageData, error: null };
        } catch (error: any) {
          // Handle rate limiting (429 error)
          if (error.status === 429) {
            const retryAfter = parseInt(error.headers?.['retry-after'] || '900');

            // Try to get existing cache
            const existingCache = await getCachedUsageFromStorage(iccid);

            if (existingCache) {
              // Update cache with retry-after info
              await cacheUsageInStorage(iccid, {
                ...existingCache,
                retryAfter,
                timestamp: now
              });

              return { iccid, data: existingCache.data, error: null };
            }

            return { iccid, data: null, error: `Rate limited for ${iccid}. Try again in ${retryAfter} seconds.` };
          }

          // For other errors, try to return cached data if available
          const existingCache = await getCachedUsageFromStorage(iccid);
          if (existingCache) {
            console.warn(`API error for ${iccid}, returning cached data:`, error);
            return { iccid, data: existingCache.data, error: null };
          }

          return { iccid, data: null, error: error.message || `Failed to fetch usage for ${iccid}` };
        }
      });

      // Wait for all fetches to complete
      const fetchResults = await Promise.all(fetchPromises);

      // Combine all results
      fetchResults.forEach(({ iccid, data, error }) => {
        if (error) {
        } else if (data) {
          results[iccid] = data;
        }
      });

      return results;
    },
    staleTime: CACHE_DURATION,
    gcTime: CACHE_DURATION * 2, // Keep in memory cache for 30 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on rate limit errors
      if (error.status === 429) return false;
      return failureCount < 3;
    },
    enabled: iccids.length > 0
  });
};

// AsyncStorage cache functions (same as before)
async function getCachedUsageFromStorage(iccid: string): Promise<CacheEntry | null> {
  try {
    const cached = await AsyncStorage.getItem(`${CACHE_KEY_PREFIX}${iccid}`);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.warn('Failed to get cached usage from storage:', error);
    return null;
  }
}

async function cacheUsageInStorage(iccid: string, cacheEntry: CacheEntry): Promise<void> {
  try {
    await AsyncStorage.setItem(
      `${CACHE_KEY_PREFIX}${iccid}`,
      JSON.stringify(cacheEntry)
    );
  } catch (error) {
    console.warn('Failed to cache usage in storage:', error);
  }
}

// Backend cache functions (same as before)
async function cacheUsage(iccid: string, data: any) {
  return await fetchClient.POST('/sim-usage/{iccid}', {
    body: {
      data: data
    },
    params: {
      path: {
        iccid: iccid
      }
    }
  });
}

// Utility functions updated to handle multiple ICCIDs
export async function clearUsageCaches(iccids: string[]) {
  try {
    await AsyncStorage.multiRemove(
      iccids.map(iccid => `${CACHE_KEY_PREFIX}${iccid}`)
    );
  } catch (error) {
    console.warn('Failed to clear usage caches:', error);
  }
}

export async function clearAllUsageCaches() {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const usageKeys = keys.filter(key => key.startsWith(CACHE_KEY_PREFIX));
    await AsyncStorage.multiRemove(usageKeys);
  } catch (error) {
    console.warn('Failed to clear all usage caches:', error);
  }
}

function generateFakeUsageData(iccids: string[]): Record<string, airaloApi.Usage> {
  const results: Record<string, any> = {};
  const now = new Date();
  const expiryDate = new Date(now);
  expiryDate.setMonth(now.getMonth() + 1); // Expires in 1 month

  const statusOptions = ['NOT_ACTIVE', 'ACTIVE', 'FINISHED', 'UNKNOWN', 'EXPIRED'];
  const packageSizes = [100, 250, 500, 1024, 2048, 5120, 10240]; // MB
  const voiceOptions = [0, 30, 60, 100, 200, 500]; // Minutes
  const textOptions = [0, 50, 100, 200, 500]; // Messages

  iccids.forEach((iccid, index) => {
    const total = packageSizes[Math.floor(Math.random() * packageSizes.length)];
    const remaining = Math.max(0, Math.floor(total * Math.random()));
    const status = statusOptions[index % statusOptions.length]; // Distribute statuses evenly

    results[iccid] = {
      remaining,
      total,
      expired_at: expiryDate.toISOString(),
      is_unlimited: Math.random() > 0.8, // 20% chance of being unlimited
      status,
      remaining_voice: voiceOptions[Math.floor(Math.random() * voiceOptions.length)],
      remaining_text: textOptions[Math.floor(Math.random() * textOptions.length)],
      total_voice: voiceOptions[Math.floor(Math.random() * voiceOptions.length)],
      total_text: textOptions[Math.floor(Math.random() * textOptions.length)],
      // Add some metadata to indicate this is fake data
      _fake: true,
      _generatedAt: new Date().toISOString()
    };
  });

  return results;
}
