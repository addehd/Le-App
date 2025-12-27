// Pure localStorage approach - no Zustand, no complex state management

interface UserData {
  id: string;
  email: string;
  full_name?: string;
  friends: string[];
  isLoggedIn: boolean;
}

interface SharedLink {
  id: string;
  url: string;
  title?: string;
  description?: string;
  sharedBy: string;
  sharedAt: string;
}

// Simple localStorage helpers
export const storage = {
  // User auth data
  saveUser: (userData: UserData) => {
    localStorage.setItem('user', JSON.stringify(userData));
  },
  
  getUser: (): UserData | null => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  
  clearUser: () => {
    localStorage.removeItem('user');
  },
  
  // Shared links data
  saveLinks: (links: SharedLink[]) => {
    localStorage.setItem('shared-links', JSON.stringify(links));
  },
  
  getLinks: (): SharedLink[] => {
    const links = localStorage.getItem('shared-links');
    return links ? JSON.parse(links) : [];
  },
  
  addLink: (link: SharedLink) => {
    const existingLinks = storage.getLinks();
    const updatedLinks = [link, ...existingLinks];
    storage.saveLinks(updatedLinks);
    return updatedLinks;
  },
  
  removeLink: (linkId: string) => {
    const existingLinks = storage.getLinks();
    const updatedLinks = existingLinks.filter(link => link.id !== linkId);
    storage.saveLinks(updatedLinks);
    return updatedLinks;
  }
};