import { useRef, useCallback, useEffect } from 'react';

type AnyFunction = (...args: any[]) => void;

export function useThrottledCallback<T extends AnyFunction>(
  callback: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  const lastCalledRef = useRef<number>(0);

  const throttledFunction = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastCalledRef.current > delay) {
        lastCalledRef.current = now;
        callback(...args);
      }
    },
    [callback, delay]
  );

  // No cleanup needed for this pattern

  return throttledFunction;
}
