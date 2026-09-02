import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { authService } from '../services/auth/auth-service';
import { clearStoredSession, getStoredAccessToken, saveAccessToken } from '../services/auth/session-storage';
import type {
  AuthenticatedUser,
  LoginResponse,
  LoginRequest,
  UserRole,
} from '../types/auth';

type AuthStatus = 'checking' | 'unauthenticated' | 'authenticated';

interface AuthContextValue {
  user: AuthenticatedUser | null;
  status: AuthStatus;
  login: (request: LoginRequest) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  hasRole: (roles: readonly UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>('checking');

  useEffect(() => {
    const restoreSession = async () => {
      if (!getStoredAccessToken()) {
        setStatus('unauthenticated');
        return;
      }
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
        setStatus('authenticated');
      } catch {
        clearStoredSession();
        setUser(null);
        setStatus('unauthenticated');
      }
    };
    void restoreSession();
  }, []);

  const login = useCallback(
    async (request: LoginRequest): Promise<LoginResponse> => {
      const response = await authService.login(request);
      saveAccessToken(response.accessToken);
      setUser(response.user);
      setStatus('authenticated');
      return response;
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // The local session must be cleared even when the gateway is unavailable.
    } finally {
      clearStoredSession();
      setUser(null);
      setStatus('unauthenticated');
    }
  }, []);

  const hasRole = useCallback(
    (roles: readonly UserRole[]) => Boolean(user && roles.includes(user.role)),
    [user],
  );
  const value = useMemo(
    () => ({ user, status, login, logout, hasRole }),
    [hasRole, login, logout, status, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
