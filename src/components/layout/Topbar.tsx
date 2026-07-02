import type { ReactNode } from 'react';
import { Menu, Search, Sun, Moon } from 'lucide-react';
import { NotificationBell } from './NotificationBell';
import { useUiStore } from '@/store/uiStore';
import { useThemeStore } from '@/store/themeStore';

export function Topbar({ title, right }: { title: string; right?: ReactNode }) {
  const { setMobileNavOpen, setCommandPaletteOpen } = useUiStore();
  const { theme, setTheme } = useThemeStore();
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-ink-100 dark:border-ink-800 bg-white/80 dark:bg-ink-950/80 backdrop-blur px-4 sm:px-6 py-4">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={() => setMobileNavOpen(true)}
          className="lg:hidden shrink-0 rounded-lg p-2 hover:bg-ink-50 dark:hover:bg-ink-900"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-lg sm:text-xl font-bold truncate">{title}</h1>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="hidden sm:flex items-center gap-2 rounded-xl px-3 py-2.5 bg-ink-50 dark:bg-ink-900 hover:bg-ink-100 dark:hover:bg-ink-800 text-ink-400 text-sm transition-colors"
        >
          <Search className="h-4 w-4" />
          Search
          <kbd className="text-[10px] bg-white dark:bg-ink-800 rounded px-1.5 py-0.5 border border-ink-100 dark:border-ink-700">
            ⌘K
          </kbd>
        </button>
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="sm:hidden rounded-xl p-2.5 bg-ink-50 dark:bg-ink-900 text-ink-400"
          aria-label="Search"
        >
          <Search className="h-[18px] w-[18px]" />
        </button>

        {right}
        <NotificationBell />

        <button
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
          className="rounded-xl p-2.5 bg-ink-50 dark:bg-ink-900 hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors"
          aria-label="Toggle dark mode"
        >
          {isDark ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
        </button>
      </div>
    </header>
  );
}
