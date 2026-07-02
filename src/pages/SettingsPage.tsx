import { Monitor, Moon, Sun, LogOut } from 'lucide-react';
import { Topbar } from '@/components/layout/Topbar';
import { PageTransition } from '@/components/common/PageTransition';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { useAuth } from '@/contexts/AuthProvider';
import { useThemeStore } from '@/store/themeStore';
import { cn } from '@/utils/cn';

const THEME_OPTIONS = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
] as const;

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useThemeStore();

  return (
    <div>
      <Topbar title="Settings" />
      <PageTransition>
        <div className="px-4 sm:px-6 py-6 max-w-2xl space-y-6">
          <section className="rounded-2xl bg-white dark:bg-ink-900 shadow-soft p-5">
            <h2 className="font-bold mb-4">Account</h2>
            <div className="flex items-center gap-4">
              <Avatar name={user?.name || 'User'} size="lg" />
              <div>
                <p className="font-semibold">{user?.name}</p>
                <p className="text-sm text-ink-400">{user?.email}</p>
              </div>
            </div>
            <p className="text-xs text-ink-400 mt-4">
              Profile editing (name/email/password) isn't available yet — the API doesn't have an update-profile
              endpoint. This is a known gap, not a bug.
            </p>
          </section>

          <section className="rounded-2xl bg-white dark:bg-ink-900 shadow-soft p-5">
            <h2 className="font-bold mb-4">Appearance</h2>
            <div className="grid grid-cols-3 gap-3">
              {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setTheme(value)}
                  className={cn(
                    'flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-colors',
                    theme === value
                      ? 'border-brand-500 bg-brand-500/5'
                      : 'border-ink-100 dark:border-ink-800 hover:border-ink-200 dark:hover:border-ink-700'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-sm font-medium">{label}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-2xl bg-white dark:bg-ink-900 shadow-soft p-5">
            <h2 className="font-bold mb-1">Session</h2>
            <p className="text-sm text-ink-400 mb-4">Sign out of TaskFlow on this device.</p>
            <Button variant="danger" onClick={logout}>
              <LogOut className="h-4 w-4" /> Sign out
            </Button>
          </section>
        </div>
      </PageTransition>
    </div>
  );
}
