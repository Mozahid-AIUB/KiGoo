import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const SECURE_STORE_MAX_BYTES = 2048;

const secureStoreAdapter = {
  getItem: async (key: string) => {
    const secureValue = await SecureStore.getItemAsync(key);
    if (secureValue != null) {
      return secureValue;
    }
    // Large values are written to AsyncStorage by setItem, so fall back
    // to it whenever SecureStore doesn't have the key.
    return AsyncStorage.getItem(key);
  },
  setItem: async (key: string, value: string) => {
    if (value.length > SECURE_STORE_MAX_BYTES) {
      // Supabase sessions can exceed SecureStore's per-item limit; AsyncStorage
      // has no such cap, so large session payloads fall back to it.
      // Clear any stale copy left in SecureStore from a previous, smaller write.
      await SecureStore.deleteItemAsync(key);
      return AsyncStorage.setItem(key, value);
    }
    // Clear any stale copy left in AsyncStorage from a previous, larger write.
    await AsyncStorage.removeItem(key);
    return SecureStore.setItemAsync(key, value);
  },
  removeItem: async (key: string) => {
    await Promise.all([
      SecureStore.deleteItemAsync(key),
      AsyncStorage.removeItem(key),
    ]);
  },
};

const storage = Platform.OS === 'web' ? AsyncStorage : secureStoreAdapter;

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY. Check KiGoo/.env.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
  },
});
