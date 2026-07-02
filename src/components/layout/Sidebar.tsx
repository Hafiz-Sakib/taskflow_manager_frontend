import { NavLink } from 'react-router-dom';
import { LayoutGrid, CalendarDays, KanbanSquare, BarChart3, Sun, Pin, LogOut, Settings } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Dropdown, DropdownItem } from '@/components/ui/Dropdown';
import { WorkspaceSwitcher } from './WorkspaceSwitcher';
import { useAuth } from '@/contexts/AuthProvider';
import { useBoards } from '@/hooks/useBoards';
import { getPinnedBoardIds } from '@/utils/localPrefs';
import { cn } from '@/utils/cn';

const links = [
  { to: '/app', label: 'Dashboard', icon: LayoutGrid, end: true },
  { to: '/app/today', label: 'Today', icon: Sun },
  { to: '/app/boards', label: 'Boards', icon: KanbanSquare },
  { to: '/app/calendar', label: 'Calendar', icon: CalendarDays },
  { to: '/app/analytics', label: 'Analytics', icon: BarChart3 },
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { user, logout } = useAuth();
  const { data: boards } = useBoards();
  const pinnedIds = getPinnedBoardIds();
  const pinnedBoards = (boards || []).filter((b) => pinnedIds.includes(b._id));

  return (
    <aside className="flex h-full w-64 flex-col border-r border-ink-100 dark:border-ink-800 bg-white dark:bg-ink-950 px-4 py-6">
      <div className="px-2 mb-6">
        <WorkspaceSwitcher />
      </div>

      <nav className="flex flex-col gap-1">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-brand-500/10 text-brand-600 dark:text-brand-300'
                  : 'text-ink-500 hover:bg-ink-50 dark:hover:bg-ink-900'
              )
            }
          >
            <Icon className="h-[18px] w-[18px]" />
            {label}
          </NavLink>
        ))}
      </nav>

      {pinnedBoards.length > 0 && (
        <div className="mt-6">
          <p className="px-3 mb-2 text-xs font-bold uppercase tracking-wide text-ink-400">Pinned</p>
          <div className="flex flex-col gap-1">
            {pinnedBoards.map((b) => (
              <NavLink
                key={b._id}
                to={`/app/boards/${b._id}`}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors truncate',
                    isActive
                      ? 'bg-brand-500/10 text-brand-600 dark:text-brand-300'
                      : 'text-ink-500 hover:bg-ink-50 dark:hover:bg-ink-900'
                  )
                }
              >
                <Pin className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{b.title}</span>
              </NavLink>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1" />

      <div className="border-t border-ink-100 dark:border-ink-800 pt-4">
        <Dropdown
          align="left"
          trigger={
            <button className="flex w-full items-center gap-3 px-2 py-1.5 rounded-xl hover:bg-ink-50 dark:hover:bg-ink-900">
              <Avatar name={user?.name || 'User'} />
              <div className="min-w-0 text-left">
                <p className="text-sm font-semibold truncate">{user?.name}</p>
                <p className="text-xs text-ink-400 truncate">{user?.email}</p>
              </div>
            </button>
          }
        >
          {(close) => (
            <>
              <DropdownItem
                onClick={() => {
                  close();
                  window.location.href = '/app/settings';
                }}
              >
                <Settings className="h-4 w-4" /> Settings
              </DropdownItem>
              <DropdownItem
                danger
                onClick={() => {
                  close();
                  logout();
                }}
              >
                <LogOut className="h-4 w-4" /> Sign out
              </DropdownItem>
            </>
          )}
        </Dropdown>
      </div>
    </aside>
  );
}
