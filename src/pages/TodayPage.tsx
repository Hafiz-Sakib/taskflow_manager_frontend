import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { Topbar } from '@/components/layout/Topbar';
import { PageTransition } from '@/components/common/PageTransition';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { useTasksList } from '@/hooks/useTasks';
import { useBoards } from '@/hooks/useBoards';
import { isOverdue, isDueToday, formatDate } from '@/utils/date';

export default function TodayPage() {
  const { data: boards } = useBoards();
  const { data, isLoading } = useTasksList({ sort: 'dueDate', limit: 100 });

  const items = (data?.items || []).filter((t) => isOverdue(t.dueDate, t.column) || isDueToday(t.dueDate, t.column));
  const boardTitle = (boardId: string) => boards?.find((b) => b._id === boardId)?.title || 'Board';

  return (
    <div>
      <Topbar title="Today" />
      <PageTransition>
        <div className="px-4 sm:px-6 py-6">
          {isLoading ? (
            <Spinner full />
          ) : items.length === 0 ? (
            <EmptyState
              icon={<CheckCircle2 className="h-10 w-10" />}
              title="You're all caught up"
              description="Nothing overdue or due today."
            />
          ) : (
            <div className="rounded-2xl bg-white dark:bg-ink-900 shadow-soft divide-y divide-ink-100 dark:divide-ink-800 max-w-2xl">
              {items.map((t) => {
                const overdue = isOverdue(t.dueDate, t.column);
                return (
                  <Link
                    key={t._id}
                    to={`/app/boards/${t.board}`}
                    className="flex items-center gap-3 p-4 hover:bg-ink-50 dark:hover:bg-ink-800"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold">{t.title}</p>
                      <p className="text-xs text-ink-400 mt-0.5">
                        {boardTitle(t.board)} · {t.column}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <PriorityBadge priority={t.priority} />
                      <span className={`text-xs font-medium ${overdue ? 'text-danger' : 'text-ink-400'}`}>
                        {overdue ? 'Overdue' : 'Today'} · {formatDate(t.dueDate)}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </PageTransition>
    </div>
  );
}
