import { useMemo, useState, type FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Topbar } from '@/components/layout/Topbar';
import { PageTransition } from '@/components/common/PageTransition';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Spinner } from '@/components/ui/Spinner';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { useTasksList } from '@/hooks/useTasks';
import { useBoards } from '@/hooks/useBoards';
import { tasksApi } from '@/api/tasks';
import { extractErrorMessage } from '@/api/axios';
import { formatDate } from '@/utils/date';
import { cn } from '@/utils/cn';

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function buildMonthGrid(cursor: Date) {
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = Array(firstDay.getDay()).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export default function CalendarPage() {
  const [cursor, setCursor] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [addOpen, setAddOpen] = useState(false);
  const { data, isLoading } = useTasksList({ limit: 200 });
  const { data: boards } = useBoards();
  const queryClient = useQueryClient();

  const createTask = useMutation({
    mutationFn: tasksApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['boards'] });
      toast.success('Task created');
      setAddOpen(false);
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });

  const tasksWithDueDate = (data?.items || []).filter((t) => t.dueDate);
  const cells = useMemo(() => buildMonthGrid(cursor), [cursor]);
  const tasksForDay = (day: Date) => tasksWithDueDate.filter((t) => sameDay(new Date(t.dueDate as string), day));
  const selectedTasks = tasksForDay(selectedDay);
  const boardTitle = (id: string) => boards?.find((b) => b._id === id)?.title || 'Board';

  return (
    <div>
      <Topbar title="Calendar" />
      <PageTransition>
        <div className="px-4 sm:px-6 py-6">
          {isLoading ? (
            <Spinner full />
          ) : (
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-ink-900 shadow-soft p-4 sm:p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-lg">
                    {MONTHS[cursor.getMonth()]} {cursor.getFullYear()}
                  </h2>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setCursor((c) => new Date(c.getFullYear(), c.getMonth() - 1, 1))}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setCursor(new Date())}>
                      Today
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setCursor((c) => new Date(c.getFullYear(), c.getMonth() + 1, 1))}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-7 text-center text-xs font-semibold text-ink-400 mb-2">
                  {WEEKDAYS.map((d) => (
                    <div key={d}>{d}</div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1.5">
                  {cells.map((day, i) => {
                    const dayTasks = day ? tasksForDay(day) : [];
                    const isSelected = day && sameDay(day, selectedDay);
                    const isToday = day && sameDay(day, new Date());
                    return (
                      <button
                        key={i}
                        disabled={!day}
                        onClick={() => day && setSelectedDay(day)}
                        className={cn(
                          'aspect-square rounded-xl p-1.5 text-left text-xs transition-colors flex flex-col',
                          !day
                            ? 'invisible'
                            : isSelected
                            ? 'bg-brand-500 text-white'
                            : isToday
                            ? 'bg-brand-500/10 text-brand-600 dark:text-brand-300'
                            : 'hover:bg-ink-50 dark:hover:bg-ink-800'
                        )}
                      >
                        <span className="font-semibold">{day?.getDate()}</span>
                        {dayTasks.length > 0 && (
                          <span className="mt-auto flex gap-0.5 flex-wrap">
                            {dayTasks.slice(0, 3).map((t) => (
                              <span
                                key={t._id}
                                className={cn('h-1.5 w-1.5 rounded-full', isSelected ? 'bg-white' : 'bg-brand-500')}
                              />
                            ))}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-bold">{formatDate(selectedDay.toISOString())}</h2>
                  <Button variant="ghost" size="sm" onClick={() => setAddOpen((o) => !o)}>
                    <Plus className="h-3.5 w-3.5" /> Add task
                  </Button>
                </div>

                {addOpen && (
                  <DayTaskForm
                    boards={boards || []}
                    selectedDay={selectedDay}
                    onSubmit={(payload) => createTask.mutate(payload)}
                    isPending={createTask.isPending}
                    onCancel={() => setAddOpen(false)}
                  />
                )}

                <div className="rounded-2xl bg-white dark:bg-ink-900 shadow-soft divide-y divide-ink-100 dark:divide-ink-800">
                  {selectedTasks.length === 0 && <p className="text-sm text-ink-400 p-4">No tasks due this day.</p>}
                  {selectedTasks.map((t) => (
                    <div key={t._id} className="p-3.5">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="text-sm font-semibold">{t.title}</p>
                        <PriorityBadge priority={t.priority} />
                      </div>
                      <p className="text-xs text-ink-400">
                        {boardTitle(t.board)} · {t.column}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </PageTransition>
    </div>
  );
}

function DayTaskForm({
  boards,
  selectedDay,
  onSubmit,
  isPending,
  onCancel,
}: {
  boards: { _id: string; title: string; columns: string[] }[];
  selectedDay: Date;
  onSubmit: (payload: {
    title: string;
    board: string;
    column: string;
    priority: 'low' | 'medium' | 'high';
    dueDate: string;
  }) => void;
  isPending: boolean;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState('');
  const [boardId, setBoardId] = useState(boards[0]?._id || '');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const board = boards.find((b) => b._id === boardId) || boards[0];

  if (boards.length === 0) {
    return (
      <div className="rounded-2xl bg-white dark:bg-ink-900 shadow-soft p-4 mb-4">
        <p className="text-sm text-ink-400">Create a board first before adding tasks from the calendar.</p>
      </div>
    );
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !board) return;
    onSubmit({
      title: title.trim(),
      board: board._id,
      column: board.columns[0],
      priority,
      dueDate: selectedDay.toISOString(),
    });
    setTitle('');
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl bg-white dark:bg-ink-900 shadow-soft p-4 mb-4 space-y-3">
      <Input autoFocus placeholder="Task title" value={title} onChange={(e) => setTitle(e.target.value)} />
      <div className="grid grid-cols-2 gap-2">
        <Select value={boardId || board?._id} onChange={(e) => setBoardId(e.target.value)}>
          {boards.map((b) => (
            <option key={b._id} value={b._id}>
              {b.title}
            </option>
          ))}
        </Select>
        <Select value={priority} onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}>
          <option value="low">Low priority</option>
          <option value="medium">Medium priority</option>
          <option value="high">High priority</option>
        </Select>
      </div>
      <p className="text-xs text-ink-400">
        Due <span className="font-semibold">{formatDate(selectedDay.toISOString())}</span> — goes into "
        {board?.columns[0]}"
      </p>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" size="sm" isLoading={isPending}>
          Create task
        </Button>
      </div>
    </form>
  );
}
