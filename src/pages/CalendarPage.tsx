import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Topbar } from '@/components/layout/Topbar';
import { PageTransition } from '@/components/common/PageTransition';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { useTasksList } from '@/hooks/useTasks';
import { useBoards } from '@/hooks/useBoards';
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
  const { data, isLoading } = useTasksList({ limit: 200 });
  const { data: boards } = useBoards();

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
                <h2 className="font-bold mb-3">{formatDate(selectedDay.toISOString())}</h2>
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
