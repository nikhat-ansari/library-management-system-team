const SESSION_STORAGE_KEY = 'lms.auth.session';

export function getStoredAccessToken(): string | null {
  try {
    return localStorage.getItem(SESSION_STORAGE_KEY) || null;
  } catch {
    clearStoredSession();
    return null;
  }
}

export function saveAccessToken(accessToken: string): void {
  localStorage.setItem(SESSION_STORAGE_KEY, accessToken);
}

export function clearStoredSession(): void {
  localStorage.removeItem(SESSION_STORAGE_KEY);
}
