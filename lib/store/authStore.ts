import { create } from 'zustand';
import { persist } from 'zustand/middleware';
// import { supabase } from '../api/supabaseClient';
// import { User, Session } from '@supabase/supabase-js';
import { Platform } from 'react-native';

// Mock types for testing
interface User {
  id: string;
  email?: string;
}

interface Session {
  user?: User;
}

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  friends: string[];
}

interface AuthState {
  user: User | null;
  userProfile: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => void;
  loadUserProfile: (userId: string) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  addFriend: (friendId: string) => Promise<void>;
  removeFriend: (friendId: string) => Promise<void>;
}

export const useAuthStore = Platform.OS === 'web' 
  ? create<AuthState>()((set, get) => ({
      user: null,
      userProfile: null,
      session: null,
      isLoading: true,
      error: null,

      initialize: () => {
        // Mock initialization for testing
        console.log('Auth store initialized');
        set({ isLoading: false });
      },

      loadUserProfile: async (userId: string) => {
        console.log('Mock loadUserProfile:', userId);
      },

      signIn: async (email: string, password: string) => {
        console.log('Mock signIn:', email);
        set({ isLoading: true, error: null });
        
        setTimeout(() => {
          set({ 
            isLoading: false,
            user: { id: '1', email },
            session: { user: { id: '1', email } }
          });
        }, 1000);
      },

      signUp: async (email: string, password: string) => {
        console.log('Mock signUp:', email);
        set({ isLoading: true, error: null });
        
        setTimeout(() => {
          set({ isLoading: false });
        }, 1000);
      },

      signOut: async () => {
        console.log('Mock signOut');
        set({ 
          isLoading: false,
          user: null,
          session: null,
          userProfile: null 
        });
      },

      updateProfile: async (updates: Partial<UserProfile>) => {
        console.log('Mock updateProfile:', updates);
      },

      addFriend: async (friendId: string) => {
        console.log('Mock addFriend:', friendId);
      },

      removeFriend: async (friendId: string) => {
        console.log('Mock removeFriend:', friendId);
      },
    }))
  : create<AuthState>()(
    persist(
      (set, get) => ({
        user: null,
        userProfile: null,
        session: null,
        isLoading: true,
        error: null,

        initialize: () => {
          console.log('Native auth store initialized');
          set({ isLoading: false });
        },

        loadUserProfile: async (userId: string) => {
          console.log('Native mock loadUserProfile:', userId);
        },

        signIn: async (email: string, password: string) => {
          console.log('Native mock signIn:', email);
          set({ isLoading: true });
          setTimeout(() => {
            set({ 
              isLoading: false,
              user: { id: '1', email },
              session: { user: { id: '1', email } }
            });
          }, 1000);
        },

        signUp: async (email: string, password: string) => {
          console.log('Native mock signUp:', email);
          set({ isLoading: true });
          setTimeout(() => set({ isLoading: false }), 1000);
        },

        signOut: async () => {
          console.log('Native mock signOut');
          set({ 
            user: null,
            session: null,
            userProfile: null,
            isLoading: false
          });
        },

        updateProfile: async (updates: Partial<UserProfile>) => {
          console.log('Native mock updateProfile:', updates);
        },

        addFriend: async (friendId: string) => {
          console.log('Native mock addFriend:', friendId);
        },

        removeFriend: async (friendId: string) => {
          console.log('Native mock removeFriend:', friendId);
        },
      }),
      {
        name: 'auth-store',
        storage: {
          getItem: async (name) => {
            try {
              const AsyncStorage = require('@react-native-async-storage/async-storage').default;
              return await AsyncStorage.getItem(name);
            } catch {
              return null;
            }
          },
          setItem: async (name, value) => {
            try {
              const AsyncStorage = require('@react-native-async-storage/async-storage').default;
              await AsyncStorage.setItem(name, value);
            } catch {}
          },
          removeItem: async (name) => {
            try {
              const AsyncStorage = require('@react-native-async-storage/async-storage').default;
              await AsyncStorage.removeItem(name);
            } catch {}
          },
        } as any,
      }
    )
  );