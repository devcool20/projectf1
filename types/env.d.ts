/// <reference types="node" />

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      EXPO_PUBLIC_SUPABASE_URL: string;
      EXPO_PUBLIC_SUPABASE_ANON_KEY: string;
      EXPO_PUBLIC_RAPIDAPI_KEY: string;
      EXPO_PUBLIC_NEWS_API_KEY: string;
    }
  }
}

export {};