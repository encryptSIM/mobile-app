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

  const sortedKeys = Object.keys(params).sort();
  const paramString = sortedKeys
    .map((key) => {
      const value =
        params[key] !== undefined && params[key] !== null
          ? String(params[key])
          : '';
      return (
        encodeURIComponent(key).replace(/[.#$[\]]/g, '_') +
        '=' +
        encodeURIComponent(value).replace(/[.#$[\]]/g, '_')
      );
    })
    .join('&');

  return paramString ? `${baseKey}:${paramString}` : baseKey;
};
