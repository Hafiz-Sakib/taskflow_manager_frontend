import { useState, type FormEvent } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { AnimatePresence } from 'framer-motion';
import { Plus, ChevronDown, ChevronRight } from 'lucide-react';
import { TaskCard } from './TaskCard';
import type { Task } from '@/types/models';
import { cn } from '@/utils/cn';

export function KanbanColumn({
  column,
  tasks,
  ownerName,
  collapsed,
  onToggleCollapse,
  onQuickAdd,
  onOpenTask,
  onEditTask,
  onDeleteTask,
  onArchiveTask,
  onToggleComplete,
}: {
  column: string;
  tasks: Task[];
  ownerName: string;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onQuickAdd: (column: string, title: string) => void;
  onOpenTask: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  onArchiveTask: (task: Task) => void;
  onToggleComplete: (task: Task) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column });
  const [quickOpen, setQuickOpen] = useState(false);
  const [quickTitle, setQuickTitle] = useState('');

  const submitQuickAdd = (e: FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) {
      setQuickOpen(false);
      return;
    }
    onQuickAdd(column, quickTitle.trim());
    setQuickTitle('');
  };

  if (collapsed) {
    return (
      <button
        onClick={onToggleCollapse}
        className="flex w-12 shrink-0 flex-col items-center gap-3 rounded-2xl bg-white dark:bg-ink-900 shadow-soft py-4 hover:bg-ink-50 dark:hover:bg-ink-800"
      >
        <ChevronRight className="h-4 w-4 text-ink-400" />
        <span className="text-xs font-bold text-ink-500 [writing-mode:vertical-rl]">{column}</span>
        <span className="text-xs text-ink-400 bg-ink-100 dark:bg-ink-800 rounded-full h-5 w-5 flex items-center justify-center">
          {tasks.length}
        </span>
      </button>
    );
  }

  return (
    <div className="flex w-[300px] shrink-0 flex-col">
      <div className="flex items-center justify-between mb-3 px-1">
        <button
          onClick={onToggleCollapse}
          className="flex items-center gap-1.5 text-ink-400 hover:text-ink-700 dark:hover:text-ink-200"
        >
          <ChevronDown className="h-4 w-4" />
        </button>
        <h3 className="font-semibold text-sm flex-1 ml-1">{column}</h3>
        <span className="text-xs text-ink-400 bg-ink-100 dark:bg-ink-800 rounded-full px-2 py-0.5 mr-1">
          {tasks.length}
        </span>
        <button
          onClick={() => setQuickOpen(true)}
          className="text-ink-400 hover:text-brand-500 rounded p-1"
          aria-label={`Add task to ${column}`}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          'flex flex-col gap-2.5 min-h-[140px] rounded-2xl p-1.5 flex-1 transition-colors',
          isOver && 'ring-2 ring-brand-400 bg-brand-50/60 dark:bg-brand-900/20'
        )}
      >
        <SortableContext items={tasks.map((t) => t._id)} strategy={verticalListSortingStrategy}>
          <AnimatePresence initial={false}>
            {tasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                ownerName={ownerName}
                onOpen={onOpenTask}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
                onArchive={onArchiveTask}
                onToggleComplete={onToggleComplete}
              />
            ))}
          </AnimatePresence>
        </SortableContext>

        {tasks.length === 0 && !quickOpen && <p className="text-xs text-ink-400 text-center py-6">No tasks yet</p>}

        {quickOpen ? (
          <form onSubmit={submitQuickAdd}>
            <input
              autoFocus
              value={quickTitle}
              onChange={(e) => setQuickTitle(e.target.value)}
              onBlur={() => !quickTitle.trim() && setQuickOpen(false)}
              onKeyDown={(e) => e.key === 'Escape' && setQuickOpen(false)}
              placeholder="Task title, press Enter"
              className="w-full rounded-xl border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-900 px-3 py-2 text-sm outline-none focus:border-brand-400"
            />
          </form>
        ) : (
          <button
            onClick={() => setQuickOpen(true)}
            className="flex items-center gap-1.5 text-xs font-medium text-ink-400 hover:text-brand-500 px-1.5 py-2"
          >
            <Plus className="h-3.5 w-3.5" /> Add task
          </button>
        )}
      </div>
    </div>
  );
}
