import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { Topbar } from '@/components/layout/Topbar';
import { PageTransition } from '@/components/common/PageTransition';
import { EmptyState } from '@/components/ui/EmptyState';
import { BoardCardSkeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { useAuth } from '@/contexts/AuthProvider';
import { useBoards } from '@/hooks/useBoards';
import { useDashboardStats } from '@/hooks/useAnalytics';
import { useTasksList } from '@/hooks/useTasks';
import { formatDate, isDoneColumn } from '@/utils/date';

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: boards, isLoading: boardsLoading } = useBoards();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: upcoming } = useTasksList({ sort: 'dueDate', limit: 6 });

  const loading = boardsLoading || statsLoading;

  return (
    <div>
      <Topbar title={`Hi, ${user?.name?.split(' ')[0] || 'there'}`} />

      <PageTransition>
        <div className="px-4 sm:px-6 py-6">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3].map((i) => (
                <BoardCardSkeleton key={i} />
              ))}
            </div>
          ) : !boards || boards.length === 0 ? (
            <EmptyState
              title="Welcome to TaskFlow"
              description="Create your first board to start tracking tasks."
              action={
                <Link to="/app/boards">
                  <Button>+ Create a board</Button>
                </Link>
              }
            />
          ) : (
            <>
              {(stats?.overdueCount ?? 0) > 0 && (
                <Link
                  to="/app/today"
                  className="flex items-center justify-between gap-3 rounded-2xl bg-danger/10 text-danger px-5 py-3.5 mb-6 hover:bg-danger/15 transition-colors"
                >
                  <span className="flex items-center gap-2 text-sm font-semibold">
                    <AlertTriangle className="h-4 w-4" />
                    {stats!.overdueCount} task{stats!.overdueCount === 1 ? '' : 's'} overdue
                  </span>
                  <span className="text-sm font-semibold">View Today →</span>
                </Link>
              )}

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard label="Boards" value={stats?.boardCount ?? 0} />
                <StatCard label="Total tasks" value={stats?.totalTasks ?? 0} />
                <StatCard label="Completion rate" value={`${stats?.completionRate ?? 0}%`} accent="text-success" />
                <StatCard label="Overdue" value={stats?.overdueCount ?? 0} accent="text-danger" />
              </div>

              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <h2 className="font-bold mb-3">Your boards</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {boards.map((b) => (
                      <Link
                        key={b._id}
                        to={`/app/boards/${b._id}`}
                        className="rounded-2xl bg-white dark:bg-ink-900 shadow-soft p-4 block hover:shadow-card transition-shadow"
                      >
                        <p className="font-semibold text-sm mb-1">{b.title}</p>
                        <p className="text-xs text-ink-400">{b.columns.length} columns</p>
                      </Link>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="font-bold mb-3">Upcoming deadlines</h2>
                  <div className="rounded-2xl bg-white dark:bg-ink-900 shadow-soft divide-y divide-ink-100 dark:divide-ink-800">
                    {(upcoming?.items.length ?? 0) === 0 && <p className="text-sm text-ink-400 p-4">Nothing due soon.</p>}
                    {upcoming?.items
                      .filter((t) => t.dueDate && !isDoneColumn(t.column))
                      .map((t) => (
                        <Link
                          key={t._id}
                          to={`/app/boards/${t.board}`}
                          className="p-3.5 flex items-center justify-between gap-3 hover:bg-ink-50 dark:hover:bg-ink-800"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{t.title}</p>
                            <p className="text-xs text-ink-400">{formatDate(t.dueDate)}</p>
                          </div>
                          <PriorityBadge priority={t.priority} />
                        </Link>
                      ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </PageTransition>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string | number; accent?: string }) {
  return (
    <div className="rounded-2xl bg-white dark:bg-ink-900 shadow-soft p-4">
      <p className={`text-2xl font-bold leading-none ${accent || ''}`}>{value}</p>
      <p className="text-xs text-ink-400 mt-1.5">{label}</p>
    </div>
  );
}
