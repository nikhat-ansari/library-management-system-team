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
import {
  clearStoredSession,
  getStoredSession,
  saveSession,
} from '../services/auth/session-storage';
import type {
  AuthenticatedUser,
  AuthResponse,
  LoginRequest,
  UserRole,
} from '../types/auth';

type AuthStatus = 'checking' | 'unauthenticated' | 'authenticated';

interface AuthContextValue {
  user: AuthenticatedUser | null;
  status: AuthStatus;
  login: (request: LoginRequest) => Promise<AuthResponse>;
  logout: () => void;
  hasRole: (roles: readonly UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>('checking');

  useEffect(() => {
    const session = getStoredSession();
    setUser(session?.user ?? null);
    setStatus(session ? 'authenticated' : 'unauthenticated');
  }, []);

  const login = useCallback(
    async (request: LoginRequest): Promise<AuthResponse> => {
      const response = await authService.login(request);
      saveSession(response);
      setUser(response.user);
      setStatus('authenticated');
      return response;
    },
    [],
  );

  const logout = useCallback(() => {
    clearStoredSession();
    setUser(null);
    setStatus('unauthenticated');
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
