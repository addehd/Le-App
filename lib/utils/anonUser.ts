const ANON_ID_KEY = 'anon-user-id';

function generateAnonId(): string {
  return `anon-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function getAnonId(): string {
  if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
    let anonId = window.localStorage.getItem(ANON_ID_KEY);
    if (!anonId) {
      anonId = generateAnonId();
      window.localStorage.setItem(ANON_ID_KEY, anonId);
    }
    return anonId;
  }
  return generateAnonId();
}

export function getAnonUserInfo(): { id: string; name: string } {
  return { id: getAnonId(), name: 'Anonymous User' };
}
