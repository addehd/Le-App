import { QueryClient } from '@tanstack/react-query';
import { Platform } from 'react-native';

/**
 * React Query client with offline persistence
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24 hours - data kept in cache
      staleTime: 1000 * 60 * 5, // 5 minutes - data considered fresh
      retry: 1, // Retry failed requests once
      refetchOnWindowFocus: false, // Don't refetch when window regains focus
      refetchOnReconnect: true, // Refetch when reconnecting to internet
    },
    mutations: {
      retry: 0, // Don't retry failed mutations
    },
  },
});

/**
 * Persister for React Query cache
 * IMPORTANT: createSyncStoragePersister breaks web bundling (import.meta errors)
 * Following cursor rules: Keep it simple, avoid complex middleware on web
 * 
 * Native: Uses full persister with AsyncStorage
 * Web: Uses simple localStorage fallback (no persist middleware)
 */
export const persister = Platform.OS === 'web'
  ? null // Skip persister on web to avoid bundling issues
  : (() => {
      // Lazy import for native only
      const { createSyncStoragePersister } = require('@tanstack/react-query-persist-client');
      const { clientStorage } = require('./storage');
      return createSyncStoragePersister({
        storage: clientStorage,
        key: 'REACT_QUERY_OFFLINE_CACHE',
      });
    })();
