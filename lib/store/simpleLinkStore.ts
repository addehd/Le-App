import { create } from 'zustand';

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

// Simple localStorage helpers
const saveLinks = (links: SharedLink[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('shared-links', JSON.stringify(links));
  }
};

const loadLinks = (): SharedLink[] => {
  if (typeof window !== 'undefined') {
    const item = localStorage.getItem('shared-links');
    return item ? JSON.parse(item) : [];
  }
  return [];
};

export const useLinkStore = create<LinkState>((set, get) => ({
  sharedLinks: loadLinks(),
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

      const updatedLinks = [newLink, ...get().sharedLinks];
      set({
        sharedLinks: updatedLinks,
        isLoading: false,
      });

      saveLinks(updatedLinks);
      return newLink;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  removeLink: (linkId: string) => {
    const updatedLinks = get().sharedLinks.filter((link) => link.id !== linkId);
    set({ sharedLinks: updatedLinks });
    saveLinks(updatedLinks);
  },
}));