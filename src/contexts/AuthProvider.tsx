import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { authApi } from '@/api/auth';
import { useAuthStore } from '@/store/authStore';
import type { User } from '@/types/models';

interface AuthContextValue {
  user: User | null;
  isHydrating: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, isHydrating, setSession, setHydrating, clearSession } = useAuthStore();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { user: freshUser, accessToken } = await authApi.refresh();
        if (!cancelled) setSession(freshUser, accessToken);
      } catch {
        if (!cancelled) clearSession();
      } finally {
        if (!cancelled) setHydrating(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email: string, password: string) => {
    const { user: loggedInUser, accessToken } = await authApi.login({ email, password });
    setSession(loggedInUser, accessToken);
  };

  const register = async (name: string, email: string, password: string) => {
    const { user: newUser, accessToken } = await authApi.register({ name, email, password });
    setSession(newUser, accessToken);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      clearSession();
    }
  };

  return (
    <AuthContext.Provider value={{ user, isHydrating, login, register, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
