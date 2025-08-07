import { CachedData } from './types';

export const isExpired = <T>(cachedData: CachedData<T>): boolean => {
  if (!cachedData.ttl) return false;
  return Date.now() - cachedData.timestamp > cachedData.ttl;
};

export const wrapWithMetadata = <T>(
  data: T,
  ttl?: number
): CachedData<T> => ({
  data,
  timestamp: Date.now(),
  ttl,
});

export const generateCacheKey = (
  baseKey: string,
  params?: Record<string, any>
): string => {
  if (!params) return baseKey;

  const sortedParams = Object.keys(params)
    .sort()
    .reduce((result, key) => {
      result[key] = params[key];
      return result;
    }, {} as Record<string, any>);

  return `${baseKey}:${JSON.stringify(sortedParams)}`;
};
