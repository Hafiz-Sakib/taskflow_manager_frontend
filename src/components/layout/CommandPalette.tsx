import { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { useNavigate } from 'react-router-dom';
import { LayoutGrid, Sun, KanbanSquare, CalendarDays, BarChart3, Search, Plus } from 'lucide-react';
import { useUiStore } from '@/store/uiStore';
import { useBoards } from '@/hooks/useBoards';
import { useTasksList } from '@/hooks/useTasks';
import { useDebounce, useKeyboardShortcut } from '@/hooks/useUtility';

export function CommandPalette() {
  const { commandPaletteOpen, setCommandPaletteOpen } = useUiStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 250);
  const { data: boards } = useBoards();
  const { data: taskResults } = useTasksList({ search: debouncedSearch, limit: 8 });

  useKeyboardShortcut('mod+k', () => setCommandPaletteOpen(!commandPaletteOpen), [commandPaletteOpen]);

  useEffect(() => {
    if (!commandPaletteOpen) setSearch('');
  }, [commandPaletteOpen]);

  const go = (path: string) => {
    navigate(path);
    setCommandPaletteOpen(false);
  };

  return (
    <Command.Dialog
      open={commandPaletteOpen}
      onOpenChange={setCommandPaletteOpen}
      label="Command palette"
      className="fixed left-1/2 top-24 z-[60] w-full max-w-lg -translate-x-1/2 rounded-2xl bg-white dark:bg-ink-900 shadow-popover overflow-hidden"
    >
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-ink-100 dark:border-ink-800">
        <Search className="h-4 w-4 text-ink-400 shrink-0" />
        <Command.Input
          value={search}
          onValueChange={setSearch}
          placeholder="Search tasks, or jump to a page…"
          className="flex-1 bg-transparent outline-none text-sm"
          autoFocus
        />
        <kbd className="text-[10px] text-ink-400 bg-ink-50 dark:bg-ink-800 rounded px-1.5 py-0.5">Esc</kbd>
      </div>

      <Command.List className="max-h-80 overflow-y-auto p-2">
        <Command.Empty className="text-sm text-ink-400 px-3 py-6 text-center">No results found.</Command.Empty>

        {!search && (
          <Command.Group heading="Navigate" className="text-xs font-semibold text-ink-400 px-2 py-1.5">
            {[
              { label: 'Dashboard', path: '/app', icon: LayoutGrid },
              { label: 'Today', path: '/app/today', icon: Sun },
              { label: 'Boards', path: '/app/boards', icon: KanbanSquare },
              { label: 'Calendar', path: '/app/calendar', icon: CalendarDays },
              { label: 'Analytics', path: '/app/analytics', icon: BarChart3 },
            ].map(({ label, path, icon: Icon }) => (
              <Command.Item
                key={path}
                onSelect={() => go(path)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm cursor-pointer aria-selected:bg-ink-50 dark:aria-selected:bg-ink-800"
              >
                <Icon className="h-4 w-4 text-ink-400" /> {label}
              </Command.Item>
            ))}
          </Command.Group>
        )}

        {!search && (boards?.length ?? 0) > 0 && (
          <Command.Group heading="Boards" className="text-xs font-semibold text-ink-400 px-2 py-1.5 mt-2">
            {boards!.slice(0, 5).map((b) => (
              <Command.Item
                key={b._id}
                onSelect={() => go(`/app/boards/${b._id}`)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm cursor-pointer aria-selected:bg-ink-50 dark:aria-selected:bg-ink-800"
              >
                <KanbanSquare className="h-4 w-4 text-ink-400" /> {b.title}
              </Command.Item>
            ))}
          </Command.Group>
        )}

        {search && (
          <Command.Group heading="Tasks" className="text-xs font-semibold text-ink-400 px-2 py-1.5">
            {taskResults?.items.map((t) => (
              <Command.Item
                key={t._id}
                onSelect={() => go(`/app/boards/${t.board}`)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm cursor-pointer aria-selected:bg-ink-50 dark:aria-selected:bg-ink-800"
              >
                <Plus className="h-4 w-4 text-ink-400 rotate-45" /> {t.title}
              </Command.Item>
            ))}
          </Command.Group>
        )}
      </Command.List>
    </Command.Dialog>
  );
}
