import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type AsyncStorageHook<T> = {
  value: T | null;
  setValue: (newValue: T) => Promise<void>;
  removeValue: () => Promise<void>;
  loading: boolean;
  error: Error | null;
};

export function useAsyncStorage<T>(
  key: string,
  initialValue: T | null = null
): AsyncStorageHook<T> {
  const [value, setValueState] = useState<T | null>(initialValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadValue = useCallback(async () => {
    setLoading(true);
    try {
      const raw = await AsyncStorage.getItem(key);
      if (raw != null) {
        setValueState(JSON.parse(raw));
      } else {
        setValueState(null); // explicitly handle null storage
      }
    } catch (err) {
      console.warn(`AsyncStorage load error for key "${key}":`, err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [key]);

  const setValue = useCallback(
    async (newValue: T) => {
      try {
        const json = JSON.stringify(newValue);
        await AsyncStorage.setItem(key, json);
        setValueState(newValue);
      } catch (err) {
        console.warn(`AsyncStorage set error for key "${key}":`, err);
        setError(err as Error);
      }
    },
    [key]
  );

  const removeValue = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(key);
      setValueState(null);
    } catch (err) {
      console.warn(`AsyncStorage remove error for key "${key}":`, err);
      setError(err as Error);
    }
  }, [key]);

  useEffect(() => {
    loadValue();
  }, [loadValue]);

  return { value, setValue, removeValue, loading, error };
}
