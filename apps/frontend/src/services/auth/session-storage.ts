import { ACCOUNT_STATUSES, USER_ROLES, type AuthResponse } from '../../types/auth';

const SESSION_STORAGE_KEY = 'lms.auth.session';

export function getStoredSession(): AuthResponse | null {
  try {
    const rawSession = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!rawSession) return null;

    const session = JSON.parse(rawSession) as Partial<AuthResponse>;
    if (
      !session.accessToken
      || !session.user?.userId
      || !USER_ROLES.includes(session.user.role)
      || !ACCOUNT_STATUSES.includes(session.user.accountStatus)
      || session.user.accountStatus !== 'ACTIVE'
    ) return null;
    return session as AuthResponse;
  } catch {
    clearStoredSession();
    return null;
  }
}

export function saveSession(session: AuthResponse): void {
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

export function clearStoredSession(): void {
  localStorage.removeItem(SESSION_STORAGE_KEY);
}

export function getStoredAccessToken(): string | null {
  return getStoredSession()?.accessToken ?? null;
}
