import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2, Paperclip, ExternalLink } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { FormField } from '@/components/forms/FormField';
import { Avatar } from '@/components/ui/Avatar';
import { taskSchema, type TaskFormValues } from './schemas';
import { useAddComment, useAddAttachment, useChecklist, useUpdateTask } from '@/hooks/useTasks';
import { useBoardActivity } from '@/hooks/useBoards';
import { useAuth } from '@/contexts/AuthProvider';
import { formatRelative } from '@/utils/date';
import { trackRecentTask } from '@/utils/localPrefs';
import { cn } from '@/utils/cn';
import type { Task } from '@/types/models';

const TABS = ['Details', 'Checklist', 'Comments', 'Attachments', 'Activity'] as const;

export function TaskModal({
  task,
  boardId,
  columns,
  open,
  onClose,
}: {
  task: Task | null;
  boardId: string;
  columns: string[];
  open: boolean;
  onClose: () => void;
}) {
  const { user } = useAuth();
  const [tab, setTab] = useState<(typeof TABS)[number]>('Details');
  const updateTask = useUpdateTask(boardId);
  const addComment = useAddComment(boardId);
  const addAttachment = useAddAttachment(boardId);
  const checklist = useChecklist(boardId);
  const { data: activity } = useBoardActivity(boardId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<TaskFormValues>({ resolver: zodResolver(taskSchema) });

  useEffect(() => {
    if (task) {
      reset({
        title: task.title,
        description: task.description,
        column: task.column,
        priority: task.priority,
        dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
      });
      trackRecentTask(task._id);
    }
    setTab('Details');
  }, [task, reset]);

  if (!task) return null;

  const onSubmit = (values: TaskFormValues) => {
    updateTask.mutate({
      id: task._id,
      payload: { ...values, dueDate: values.dueDate || null },
    });
  };

  return (
    <Modal open={open} onClose={onClose} title={task.title} maxWidth="max-w-2xl">
      <div className="flex gap-1 border-b border-ink-100 dark:border-ink-800 mb-5 -mt-1">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'px-3 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors',
              tab === t
                ? 'border-brand-500 text-brand-600 dark:text-brand-300'
                : 'border-transparent text-ink-400 hover:text-ink-700 dark:hover:text-ink-200'
            )}
          >
            {t}
            {t === 'Checklist' &&
              task.checklist.length > 0 &&
              ` (${task.checklist.filter((c) => c.done).length}/${task.checklist.length})`}
            {t === 'Comments' && task.comments.length > 0 && ` (${task.comments.length})`}
            {t === 'Attachments' && task.attachments.length > 0 && ` (${task.attachments.length})`}
          </button>
        ))}
      </div>

      {tab === 'Details' && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField label="Title" htmlFor="title" error={errors.title?.message}>
            <Input id="title" error={errors.title?.message} {...register('title')} />
          </FormField>

          <FormField label="Description" htmlFor="description" error={errors.description?.message}>
            <Textarea id="description" placeholder="Add more detail (optional)" {...register('description')} />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Column" htmlFor="column">
              <Select id="column" {...register('column')}>
                {columns.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label="Priority" htmlFor="priority">
              <Select id="priority" {...register('priority')}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </Select>
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4 items-end">
            <FormField label="Due date" htmlFor="dueDate">
              <Input id="dueDate" type="date" {...register('dueDate')} />
            </FormField>
            <div className="flex items-center gap-2 pb-2.5">
              <Avatar name={user?.name || 'You'} size="sm" />
              <span className="text-sm text-ink-500">Created by you</span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Close
            </Button>
            <Button type="submit" isLoading={updateTask.isPending} disabled={!isDirty}>
              Save changes
            </Button>
          </div>
        </form>
      )}

      {tab === 'Checklist' && (
        <ChecklistTab
          task={task}
          onAdd={(text) => checklist.addItem.mutate({ id: task._id, text })}
          onToggle={(itemId, done) => checklist.toggleItem.mutate({ id: task._id, itemId, done })}
          onRemove={(itemId) => checklist.removeItem.mutate({ id: task._id, itemId })}
        />
      )}

      {tab === 'Comments' && (
        <CommentsTab
          task={task}
          onAdd={(text) => addComment.mutate({ id: task._id, text })}
          isPending={addComment.isPending}
        />
      )}

      {tab === 'Attachments' && (
        <AttachmentsTab
          task={task}
          onAdd={(name, url) => addAttachment.mutate({ id: task._id, name, url })}
          isPending={addAttachment.isPending}
        />
      )}

      {tab === 'Activity' && (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {(activity?.items || [])
            .filter((entry) => entry.task === task._id)
            .map((entry) => (
              <div key={entry._id} className="flex items-start gap-3 text-sm">
                <Avatar name={entry.user?.name || 'User'} size="sm" />
                <div>
                  <p>
                    <span className="font-semibold">{entry.user?.name}</span> {describeAction(entry.action)}
                  </p>
                  <p className="text-xs text-ink-400">{formatRelative(entry.createdAt)}</p>
                </div>
              </div>
            ))}
          {(activity?.items || []).filter((e) => e.task === task._id).length === 0 && (
            <p className="text-sm text-ink-400 text-center py-8">No activity recorded for this task yet.</p>
          )}
        </div>
      )}
    </Modal>
  );
}

function describeAction(action: string) {
  const map: Record<string, string> = {
    task_created: 'created this task',
    task_updated: 'updated this task',
    task_moved: 'moved this task',
    task_deleted: 'deleted this task',
    task_archived: 'archived/restored this task',
  };
  return map[action] || action;
}

function ChecklistTab({
  task,
  onAdd,
  onToggle,
  onRemove,
}: {
  task: Task;
  onAdd: (text: string) => void;
  onToggle: (itemId: string, done: boolean) => void;
  onRemove: (itemId: string) => void;
}) {
  const [text, setText] = useState('');
  const total = task.checklist.length;
  const done = task.checklist.filter((c) => c.done).length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <div>
      {total > 0 && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-ink-400 mb-1.5">
            <span>Progress</span>
            <span>{pct}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-ink-100 dark:bg-ink-800 overflow-hidden">
            <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}

      <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
        {task.checklist.map((item) => (
          <div key={item._id} className="flex items-center gap-2.5 group">
            <button
              onClick={() => onToggle(item._id, !item.done)}
              className={cn(
                'h-[18px] w-[18px] shrink-0 rounded-md border-2 flex items-center justify-center',
                item.done ? 'bg-success border-success' : 'border-ink-300 dark:border-ink-600'
              )}
            >
              {item.done && (
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                  <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
            <span className={cn('flex-1 text-sm', item.done && 'line-through text-ink-400')}>{item.text}</span>
            <button
              onClick={() => onRemove(item._id)}
              className="opacity-0 group-hover:opacity-100 text-ink-300 hover:text-danger"
              aria-label="Remove item"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        {total === 0 && <p className="text-sm text-ink-400 text-center py-6">No checklist items yet.</p>}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!text.trim()) return;
          onAdd(text.trim());
          setText('');
        }}
        className="flex gap-2"
      >
        <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Add an item…" />
        <Button type="submit" size="icon" variant="secondary" aria-label="Add checklist item">
          <Plus className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}

function CommentsTab({ task, onAdd, isPending }: { task: Task; onAdd: (text: string) => void; isPending: boolean }) {
  const [text, setText] = useState('');
  const { user } = useAuth();

  return (
    <div>
      <div className="space-y-4 mb-4 max-h-72 overflow-y-auto">
        {task.comments.map((c) => {
          const authorName = typeof c.author === 'string' ? 'User' : c.author.name;
          return (
            <div key={c._id} className="flex items-start gap-3">
              <Avatar name={authorName} size="sm" />
              <div className="flex-1 rounded-xl bg-ink-50 dark:bg-ink-800 px-3.5 py-2.5">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-sm font-semibold">{authorName}</span>
                  <span className="text-xs text-ink-400">{formatRelative(c.createdAt)}</span>
                </div>
                <p className="text-sm text-ink-600 dark:text-ink-300">{c.text}</p>
              </div>
            </div>
          );
        })}
        {task.comments.length === 0 && <p className="text-sm text-ink-400 text-center py-6">No comments yet.</p>}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!text.trim()) return;
          onAdd(text.trim());
          setText('');
        }}
        className="flex items-start gap-3"
      >
        <Avatar name={user?.name || 'You'} size="sm" />
        <div className="flex-1 flex gap-2">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write a comment…"
            className="min-h-[44px]"
          />
          <Button type="submit" isLoading={isPending}>
            Post
          </Button>
        </div>
      </form>
    </div>
  );
}

function AttachmentsTab({
  task,
  onAdd,
  isPending,
}: {
  task: Task;
  onAdd: (name: string, url: string) => void;
  isPending: boolean;
}) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');

  return (
    <div>
      <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
        {task.attachments.map((a) => (
          <a
            key={a._id}
            href={a.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 rounded-xl border border-ink-100 dark:border-ink-800 px-3.5 py-2.5 hover:bg-ink-50 dark:hover:bg-ink-800"
          >
            <Paperclip className="h-4 w-4 text-ink-400 shrink-0" />
            <span className="flex-1 text-sm font-medium truncate">{a.name}</span>
            <ExternalLink className="h-3.5 w-3.5 text-ink-400 shrink-0" />
          </a>
        ))}
        {task.attachments.length === 0 && <p className="text-sm text-ink-400 text-center py-6">No attachments yet.</p>}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim() || !url.trim()) return;
          onAdd(name.trim(), url.trim());
          setName('');
          setUrl('');
        }}
        className="flex flex-col sm:flex-row gap-2"
      >
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="File name" className="sm:w-40" />
        <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" className="flex-1" />
        <Button type="submit" isLoading={isPending}>
          Add
        </Button>
      </form>
    </div>
  );
}
