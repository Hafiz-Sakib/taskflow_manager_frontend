import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthProvider';
import { Spinner } from '@/components/ui/Spinner';

/**
 * WHY: Landing/Login/Register used to render regardless of auth state, so
 * a logged-in user who navigated back to "/" (or had it as their start
 * page) saw "Sign up" / "Sign in" again — confusing and just wrong. This
 * redirects straight to the app once we know the user is authenticated,
 * and waits for the session bootstrap (isHydrating) before deciding, so
 * there's no flash of the wrong screen on reload.
 */
export function PublicRoute({ children }: { children: ReactNode }) {
  const { user, isHydrating } = useAuth();

  if (isHydrating) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-50 dark:bg-ink-950">
        <Spinner />
      </div>
    );
  }

  if (user) return <Navigate to="/app" replace />;
  return <>{children}</>;
}
