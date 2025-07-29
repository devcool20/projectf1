import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// Create Supabase client with better error handling and persistence
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  global: {
    headers: {
      'X-Client-Info': 'projectf1-android',
    },
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Helper function to retry failed requests
export const retryRequest = async <T>(
  requestFn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error: any) {
      lastError = error;
      console.warn(`Request attempt ${attempt} failed:`, error.message);
      
      if (attempt < maxRetries) {
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
  }
  
  throw lastError;
};

// Enhanced Supabase client with retry logic
export const supabaseWithRetry = {
  ...supabase,
  from: (table: string) => {
    const originalFrom = supabase.from(table);
    
    return {
      ...originalFrom,
      select: (columns?: string) => {
        const query = originalFrom.select(columns);
        return {
          ...query,
          then: async (resolve: any, reject: any) => {
            try {
              const result = await retryRequest(() => query);
              resolve(result);
            } catch (error) {
              reject(error);
            }
          },
          catch: async (reject: any) => {
            try {
              const result = await retryRequest(() => query);
              return result;
            } catch (error) {
              reject(error);
              throw error;
            }
          }
        };
      },
      insert: (values: any) => {
        const query = originalFrom.insert(values);
        return {
          ...query,
          then: async (resolve: any, reject: any) => {
            try {
              const result = await retryRequest(() => query);
              resolve(result);
            } catch (error) {
              reject(error);
            }
          }
        };
      },
      update: (values: any) => {
        const query = originalFrom.update(values);
        return {
          ...query,
          then: async (resolve: any, reject: any) => {
            try {
              const result = await retryRequest(() => query);
              resolve(result);
            } catch (error) {
              reject(error);
            }
          }
        };
      },
      delete: () => {
        const query = originalFrom.delete();
        return {
          ...query,
          then: async (resolve: any, reject: any) => {
            try {
              const result = await retryRequest(() => query);
              resolve(result);
            } catch (error) {
              reject(error);
            }
          }
        };
      }
    };
  }
};