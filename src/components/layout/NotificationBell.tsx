import { Bell, CheckCheck } from 'lucide-react';
import { Dropdown, DropdownItem } from '@/components/ui/Dropdown';
import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications } from '@/hooks/useNotifications';
import { formatRelative } from '@/utils/date';
import { cn } from '@/utils/cn';

export function NotificationBell() {
  const { data } = useNotifications(1);
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const unread = data?.unreadCount || 0;

  return (
    <Dropdown
      trigger={
        <button
          className="relative rounded-xl p-2.5 bg-ink-50 dark:bg-ink-900 hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors"
          aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}
        >
          <Bell className="h-[18px] w-[18px]" />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>
      }
    >
      {() => (
        <div className="w-80">
          <div className="flex items-center justify-between px-2 py-1.5 mb-1">
            <p className="font-bold text-sm">Notifications</p>
            {unread > 0 && (
              <button
                onClick={() => markAllRead.mutate()}
                className="flex items-center gap-1 text-xs font-semibold text-brand-500"
              >
                <CheckCheck className="h-3.5 w-3.5" /> Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {(data?.items.length ?? 0) === 0 && (
              <p className="text-sm text-ink-400 px-2 py-6 text-center">You're all caught up.</p>
            )}
            {data?.items.map((n) => (
              <DropdownItem key={n._id} onClick={() => markRead.mutate(n._id)}>
                <span
                  className={cn('h-2 w-2 rounded-full mt-1.5 shrink-0', n.isRead ? 'bg-transparent' : 'bg-brand-500')}
                />
                <span className="flex-1 min-w-0">
                  <span className="block truncate">{n.message}</span>
                  <span className="block text-xs text-ink-400">{formatRelative(n.createdAt)}</span>
                </span>
              </DropdownItem>
            ))}
          </div>
        </div>
      )}
    </Dropdown>
  );
}
