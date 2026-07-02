import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types/models';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isHydrating: boolean;
  setSession: (user: User, accessToken: string) => void;
  setAccessToken: (accessToken: string) => void;
  setHydrating: (value: boolean) => void;
  clearSession: () => void;
}

/**
 * WHY: only `user` is persisted to localStorage, never `accessToken` —
 * access tokens are short-lived (15 min) and re-acquired on every page
 * load via POST /auth/refresh (see AuthProvider). Persisting the user
 * profile lets the UI render "Hi, Sakib" instantly on reload instead of a
 * loading flash, without ever putting a live credential in localStorage.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isHydrating: true,
      setSession: (user, accessToken) => set({ user, accessToken }),
      setAccessToken: (accessToken) => set({ accessToken }),
      setHydrating: (value) => set({ isHydrating: value }),
      clearSession: () => set({ user: null, accessToken: null }),
    }),
    {
      name: 'taskflow-auth',
      partialize: (state) => ({ user: state.user }),
    }
  )
);
