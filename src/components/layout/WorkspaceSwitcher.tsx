import { useState } from 'react';
import { ChevronsUpDown, Plus, Check, Briefcase } from 'lucide-react';
import { Dropdown, DropdownItem } from '@/components/ui/Dropdown';
import { useWorkspaces, useCreateWorkspace } from '@/hooks/useWorkspaces';
import { useUiStore } from '@/store/uiStore';

export function WorkspaceSwitcher() {
  const { data: workspaces } = useWorkspaces();
  const createWorkspace = useCreateWorkspace();
  const { activeWorkspaceId, setActiveWorkspace } = useUiStore();
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');

  const active = workspaces?.find((w) => w._id === activeWorkspaceId);

  const handleCreate = () => {
    if (!name.trim()) return;
    createWorkspace.mutate(name.trim(), {
      onSuccess: (workspace) => {
        setActiveWorkspace(workspace._id);
        setName('');
        setCreating(false);
      },
    });
  };

  return (
    <Dropdown
      align="left"
      trigger={
        <button className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm font-bold hover:bg-ink-50 dark:hover:bg-ink-900">
          <div className="h-7 w-7 rounded-lg bg-brand-gradient flex items-center justify-center shrink-0">
            <Briefcase className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="truncate flex-1 text-left">{active?.name || 'All boards'}</span>
          <ChevronsUpDown className="h-3.5 w-3.5 text-ink-400 shrink-0" />
        </button>
      }
    >
      {(close) => (
        <div className="w-56">
          <DropdownItem
            onClick={() => {
              setActiveWorkspace(null);
              close();
            }}
          >
            <span className="flex-1">All boards</span>
            {!activeWorkspaceId && <Check className="h-4 w-4 text-brand-500" />}
          </DropdownItem>
          {(workspaces || []).map((w) => (
            <DropdownItem
              key={w._id}
              onClick={() => {
                setActiveWorkspace(w._id);
                close();
              }}
            >
              <span className="flex-1 truncate">{w.name}</span>
              {activeWorkspaceId === w._id && <Check className="h-4 w-4 text-brand-500" />}
            </DropdownItem>
          ))}

          <div className="border-t border-ink-100 dark:border-ink-800 mt-1 pt-1">
            {creating ? (
              <div className="p-2 flex gap-1.5">
                <input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                  placeholder="Workspace name"
                  className="flex-1 rounded-lg border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-900 px-2 py-1.5 text-xs outline-none focus:border-brand-400"
                />
              </div>
            ) : (
              <DropdownItem onClick={() => setCreating(true)}>
                <Plus className="h-4 w-4" /> New workspace
              </DropdownItem>
            )}
          </div>
        </div>
      )}
    </Dropdown>
  );
}
