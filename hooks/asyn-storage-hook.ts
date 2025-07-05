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
    console.log(`🔄 AsyncStorage loading value for key "${key}"`);
    try {
      const raw = await AsyncStorage.getItem(key);
      console.log(`🔄 AsyncStorage raw value for key "${key}":`, raw);
      if (raw != null) {
        const parsed = JSON.parse(raw);
        console.log(`✅ AsyncStorage loaded value for key "${key}":`, parsed);
        setValueState(parsed);
      } else {
        console.log(`⚠️ AsyncStorage no value found for key "${key}"`);
        setValueState(null); // explicitly handle null storage
      }
    } catch (err) {
      console.error(`❌ AsyncStorage load error for key "${key}":`, err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [key]);

  const setValue = useCallback(
    async (newValue: T) => {
      try {
        console.log(`🔄 AsyncStorage setValue for key "${key}":`, newValue);
        if (newValue === undefined || newValue === null) {
          console.warn(`❌ AsyncStorage setValue error for key "${key}": Cannot store undefined or null values. Use removeValue() instead.`);
          return;
        }
        const json = JSON.stringify(newValue);
        console.log(`🔄 AsyncStorage setting key "${key}" with JSON:`, json);
        await AsyncStorage.setItem(key, json);
        setValueState(newValue);
        console.log(`✅ AsyncStorage setValue success for key "${key}"`);
      } catch (err) {
        console.error(`❌ AsyncStorage set error for key "${key}":`, err);
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
