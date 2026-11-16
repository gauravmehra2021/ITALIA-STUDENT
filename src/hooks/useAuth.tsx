import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import {
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
  loading: boolean;
  login: (email: string, pass: string) => Promise<AuthResponse>;
  register: (payload: { email: string; password: string; fullName: string; preferredLanguage?: number }) => Promise<User>;
  verifyOtp: (pendingUserId: string, otp: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  applyAuth: (res: AuthResponse) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(getStoredToken);
  const [user, setUser] = useState<User | null>(getStoredUser);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const savedToken = getStoredToken();
    const savedUser = getStoredUser();
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(savedUser);
    }
  }, []);

  function applyAuth(res: AuthResponse) {
    if (res.accessToken && res.user) {
      setToken(res.accessToken);
      setUser(res.user);
      setStoredAuth(res.accessToken, res.user);
    }
  }

  async function login(email: string, pass: string) {
    setLoading(true);
    try {
      const res = await authApi.login(email, pass);
      if (!res.requiresOtp && res.accessToken) {
        applyAuth(res);
      }
      return res;
    } finally {
      setLoading(false);
    }
  }

  async function register(payload: { email: string; password: string; fullName: string; preferredLanguage?: number }) {
    setLoading(true);
    try {
      return await authApi.register(payload);
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp(pendingUserId: string, otp: string) {
    setLoading(true);
    try {
      const res = await authApi.verifyOtp(pendingUserId, otp);
      if (res.accessToken) {
        applyAuth(res);
      }
      return res;
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    setLoading(true);
    try {
      await authApi.logout();
    } catch {
      clearStoredAuth();
    } finally {
      setToken(null);
      setUser(null);
      setLoading(false);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        verifyOtp,
        logout,
        applyAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

