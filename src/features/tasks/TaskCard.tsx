import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { MoreHorizontal, MessageSquare, Paperclip, CheckSquare } from 'lucide-react';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { Dropdown, DropdownItem } from '@/components/ui/Dropdown';
import { Avatar } from '@/components/ui/Avatar';
import { formatDate, isOverdue, isDueSoon, isDoneColumn } from '@/utils/date';
import type { Task } from '@/types/models';
import { cn } from '@/utils/cn';

export function TaskCard({
  task,
  ownerName,
  onOpen,
  onEdit,
  onDelete,
  onArchive,
  onToggleComplete,
}: {
  task: Task;
  ownerName: string;
  onOpen: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onArchive: (task: Task) => void;
  onToggleComplete: (task: Task) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const overdue = isOverdue(task.dueDate, task.column);
  const dueSoon = isDueSoon(task.dueDate, task.column);
  const done = isDoneColumn(task.column);
  const checklistDone = task.checklist.filter((c) => c.done).length;

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      className={cn(
        'group rounded-2xl bg-white dark:bg-ink-900 shadow-soft p-3.5 cursor-pointer transition-shadow hover:shadow-card',
        isDragging && 'opacity-40'
      )}
      onClick={() => onOpen(task)}
    >
      <div className="flex items-start gap-2.5">
        <button
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          className="mt-0.5 cursor-grab active:cursor-grabbing text-ink-300 hover:text-ink-500"
          aria-label="Drag to reorder"
        >
          <svg width="12" height="16" viewBox="0 0 12 16" fill="none">
            <circle cx="3" cy="3" r="1.3" fill="currentColor" />
            <circle cx="9" cy="3" r="1.3" fill="currentColor" />
            <circle cx="3" cy="8" r="1.3" fill="currentColor" />
            <circle cx="9" cy="8" r="1.3" fill="currentColor" />
            <circle cx="3" cy="13" r="1.3" fill="currentColor" />
            <circle cx="9" cy="13" r="1.3" fill="currentColor" />
          </svg>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleComplete(task);
          }}
          className={cn(
            'mt-0.5 h-[18px] w-[18px] shrink-0 rounded-md border-2 flex items-center justify-center transition-colors',
            done ? 'bg-success border-success' : 'border-ink-300 dark:border-ink-600 hover:border-brand-500'
          )}
          aria-label={done ? 'Mark incomplete' : 'Mark complete'}
        >
          {done && (
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
              <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className={cn('text-sm font-semibold leading-snug', done && 'line-through text-ink-400')}>
              {task.title}
            </p>
            <div onClick={(e) => e.stopPropagation()} className="opacity-0 group-hover:opacity-100 transition-opacity">
              <Dropdown
                trigger={
                  <button className="text-ink-400 hover:text-ink-900 dark:hover:text-white rounded p-0.5">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                }
              >
                {(close) => (
                  <>
                    <DropdownItem
                      onClick={() => {
                        close();
                        onEdit(task);
                      }}
                    >
                      Edit
                    </DropdownItem>
                    <DropdownItem
                      onClick={() => {
                        close();
                        onArchive(task);
                      }}
                    >
                      {task.isArchived ? 'Restore' : 'Archive'}
                    </DropdownItem>
                    <DropdownItem
                      danger
                      onClick={() => {
                        close();
                        onDelete(task);
                      }}
                    >
                      Delete
                    </DropdownItem>
                  </>
                )}
              </Dropdown>
            </div>
          </div>

          {task.labels.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {task.labels.map((l) => (
                <span
                  key={l}
                  className="rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-300 px-2 py-0.5 text-[10px] font-semibold"
                >
                  {l}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between mt-3">
            <PriorityBadge priority={task.priority} />
            <div className="flex items-center gap-2.5 text-ink-400">
              {task.checklist.length > 0 && (
                <span className="flex items-center gap-1 text-[11px] font-medium">
                  <CheckSquare className="h-3.5 w-3.5" />
                  {checklistDone}/{task.checklist.length}
                </span>
              )}
              {task.comments.length > 0 && (
                <span className="flex items-center gap-1 text-[11px] font-medium">
                  <MessageSquare className="h-3.5 w-3.5" />
                  {task.comments.length}
                </span>
              )}
              {task.attachments.length > 0 && (
                <span className="flex items-center gap-1 text-[11px] font-medium">
                  <Paperclip className="h-3.5 w-3.5" />
                  {task.attachments.length}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between mt-2.5">
            {task.dueDate ? (
              <span
                className={cn('text-xs font-medium', overdue ? 'text-danger' : dueSoon ? 'text-warning' : 'text-ink-400')}
              >
                {overdue ? 'Overdue · ' : ''}
                {formatDate(task.dueDate, 'MMM d')}
              </span>
            ) : (
              <span />
            )}
            <Avatar name={ownerName} size="sm" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
