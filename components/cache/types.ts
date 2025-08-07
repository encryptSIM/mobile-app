export interface CacheStorage {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
}

export interface RemoteCache {
  get: <T>(key: string) => Promise<T | null>;
  set: <T>(key: string, value: T, ttl?: number) => Promise<void>;
  delete: (key: string) => Promise<void>;
}

export interface CacheConfig {
  localTTL?: number; // Time to live in milliseconds
  remoteTTL?: number;
  enableLocalCache?: boolean;
  enableRemoteCache?: boolean;
  staleTime?: number; // React Query stale time
  cacheTime?: number; // React Query garbage collection time (gcTime)
}

export interface CachedData<T> {
  data: T;
  timestamp: number;
  ttl?: number;
}
