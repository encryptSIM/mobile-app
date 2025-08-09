import AsyncStorage from '@react-native-async-storage/async-storage';
import { CacheStorage } from './types';

export const createAsyncStorage = (): CacheStorage => ({
  getItem: AsyncStorage.getItem,
  setItem: AsyncStorage.setItem,
  removeItem: AsyncStorage.removeItem,
});
