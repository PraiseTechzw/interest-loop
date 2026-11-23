declare global {
  namespace NodeJS {
    interface ProcessEnv {
      EXPO_PUBLIC_NEWSAPI_KEY?: string;
      EXPO_PUBLIC_FREENEWS_KEY?: string;
      EXPO_PUBLIC_TMDB_KEY?: string;
    }
  }
}

export {};
