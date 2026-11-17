import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  SESSION_EXPIRED_EVENT,
  authApi,
  clearStoredAuth,
  getStoredToken,
  getStoredUser,
  setStoredAuth,
} from '../services/api';
import type { AuthResponse, User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (payload: { email: string; password: string; firstName: string; lastName: string }) => Promise<AuthResponse>;
  verifyOtp: (userId: string, code: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(getStoredToken);
  const [user, setUser] = useState<User | null>(getStoredUser);

  const apply = useCallback((res: AuthResponse) => {
    if (res.accessToken && res.user && !res.requiresOtp) {
      setStoredAuth(res.accessToken, res.user);
      setToken(res.accessToken);
      setUser(res.user);
    }
    return res;
  }, []);

  useEffect(() => {
    const onExpired = () => {
      setToken(null);
      setUser(null);
    };
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
  }, []);

  const login = useCallback(async (email: string, password: string) => apply(await authApi.login(email.trim(), password)), [apply]);

  const register = useCallback(
    async (payload: { email: string; password: string; firstName: string; lastName: string }) => {
      await authApi.register({ ...payload, email: payload.email.trim() });
      return apply(await authApi.login(payload.email.trim(), payload.password));
    },
    [apply],
  );

  const verifyOtp = useCallback(async (userId: string, code: string) => apply(await authApi.verifyOtp(userId, code)), [apply]);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      clearStoredAuth();
    }
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, token, login, register, verifyOtp, logout }), [user, token, login, register, verifyOtp, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
