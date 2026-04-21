import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_KEYS = {
  cart: '@binaryecom/cart',
  wishlist: '@binaryecom/wishlist',
  orders: '@binaryecom/orders',
  address: '@binaryecom/last_address',
} as const;

export async function readJSON<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function writeJSON<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore persist errors — runtime state remains intact
  }
}

export async function removeKey(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch {
    // ignore
  }
}
