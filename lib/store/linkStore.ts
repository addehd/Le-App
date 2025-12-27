import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Platform } from 'react-native';

export interface SharedLink {
  id: string;
  url: string;
  title?: string;
  description?: string;
  image?: string;
  sharedBy: string;
  sharedAt: string;
  latitude?: number;
  longitude?: number;
}

interface LinkState {
  sharedLinks: SharedLink[];
  isLoading: boolean;
  error: string | null;
  addLink: (url: string, sharedBy: string, latitude?: number, longitude?: number) => Promise<SharedLink>;
  removeLink: (linkId: string) => void;
  fetchOGData: (url: string) => Promise<{ title?: string; description?: string; image?: string }>;
}

export const useLinkStore = Platform.OS === 'web' 
  ? create<LinkState>()((set, get) => ({
      sharedLinks: [],
      isLoading: false,
      error: null,

      fetchOGData: async (url: string) => {
        try {
          // Since we can't make direct CORS requests from the app, we'll simulate OG data fetching
          // In a real app, you'd use a backend API to fetch OG data
          
          // For now, return basic data based on URL patterns
          let title = url;
          let description = '';
          let image = '';

          // Extract title from common patterns
          if (url.includes('youtube.com') || url.includes('youtu.be')) {
            title = 'YouTube Video';
            description = 'Video content from YouTube';
            image = 'https://via.placeholder.com/300x200?text=YouTube';
          } else if (url.includes('github.com')) {
            title = 'GitHub Repository';
            description = 'Code repository on GitHub';
            image = 'https://via.placeholder.com/300x200?text=GitHub';
          } else if (url.includes('twitter.com') || url.includes('x.com')) {
            title = 'Twitter/X Post';
            description = 'Social media post';
            image = 'https://via.placeholder.com/300x200?text=Twitter';
          } else if (url.includes('linkedin.com')) {
            title = 'LinkedIn Post';
            description = 'Professional network content';
            image = 'https://via.placeholder.com/300x200?text=LinkedIn';
          } else {
            // Try to extract domain as title
            try {
              const urlObj = new URL(url);
              title = urlObj.hostname.replace('www.', '');
              description = `Content from ${title}`;
              image = 'https://via.placeholder.com/300x200?text=Link';
            } catch {
              title = 'Shared Link';
              description = 'Link shared by user';
              image = 'https://via.placeholder.com/300x200?text=Link';
            }
          }

          return { title, description, image };
        } catch (error) {
          console.error('Error fetching OG data:', error);
          return {
            title: 'Shared Link',
            description: 'Link shared by user',
            image: 'https://via.placeholder.com/300x200?text=Link'
          };
        }
      },

      addLink: async (url: string, sharedBy: string, latitude?: number, longitude?: number) => {
        set({ isLoading: true, error: null });

        try {
          const ogData = await get().fetchOGData(url);
          
          const newLink: SharedLink = {
            id: Date.now().toString(),
            url,
            title: ogData.title,
            description: ogData.description,
            image: ogData.image,
            sharedBy,
            sharedAt: new Date().toISOString(),
            latitude,
            longitude,
          };

          set((state) => ({
            sharedLinks: [newLink, ...state.sharedLinks],
            isLoading: false,
          }));

          return newLink;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      removeLink: (linkId: string) => {
        set((state) => ({
          sharedLinks: state.sharedLinks.filter((link) => link.id !== linkId),
        }));
      },
    }))
  : create<LinkState>()(
    persist(
      (set, get) => ({
        sharedLinks: [],
        isLoading: false,
        error: null,

        fetchOGData: async (url: string) => {
          try {
            let title = url;
            let description = '';
            let image = '';

            if (url.includes('youtube.com') || url.includes('youtu.be')) {
              title = 'YouTube Video';
              description = 'Video content from YouTube';
              image = 'https://via.placeholder.com/300x200?text=YouTube';
            } else if (url.includes('github.com')) {
              title = 'GitHub Repository';
              description = 'Code repository on GitHub';
              image = 'https://via.placeholder.com/300x200?text=GitHub';
            } else if (url.includes('twitter.com') || url.includes('x.com')) {
              title = 'Twitter/X Post';
              description = 'Social media post';
              image = 'https://via.placeholder.com/300x200?text=Twitter';
            } else if (url.includes('linkedin.com')) {
              title = 'LinkedIn Post';
              description = 'Professional network content';
              image = 'https://via.placeholder.com/300x200?text=LinkedIn';
            } else {
              try {
                const urlObj = new URL(url);
                title = urlObj.hostname.replace('www.', '');
                description = `Content from ${title}`;
                image = 'https://via.placeholder.com/300x200?text=Link';
              } catch {
                title = 'Shared Link';
                description = 'Link shared by user';
                image = 'https://via.placeholder.com/300x200?text=Link';
              }
            }

            return { title, description, image };
          } catch (error) {
            console.error('Error fetching OG data:', error);
            return {
              title: 'Shared Link',
              description: 'Link shared by user',
              image: 'https://via.placeholder.com/300x200?text=Link'
            };
          }
        },

        addLink: async (url: string, sharedBy: string, latitude?: number, longitude?: number) => {
          set({ isLoading: true, error: null });

          try {
            const ogData = await get().fetchOGData(url);
            
            const newLink: SharedLink = {
              id: Date.now().toString(),
              url,
              title: ogData.title,
              description: ogData.description,
              image: ogData.image,
              sharedBy,
              sharedAt: new Date().toISOString(),
              latitude,
              longitude,
            };

            set((state) => ({
              sharedLinks: [newLink, ...state.sharedLinks],
              isLoading: false,
            }));

            return newLink;
          } catch (error: any) {
            set({ error: error.message, isLoading: false });
            throw error;
          }
        },

        removeLink: (linkId: string) => {
          set((state) => ({
            sharedLinks: state.sharedLinks.filter((link) => link.id !== linkId),
          }));
        },
      }),
      {
        name: 'link-store',
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