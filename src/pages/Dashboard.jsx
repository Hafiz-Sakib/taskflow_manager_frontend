import { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import Topbar from '../components/Topbar.jsx';
import Spinner from '../components/Spinner.jsx';
import EmptyState from '../components/EmptyState.jsx';
import PriorityBadge from '../components/PriorityBadge.jsx';
import { boardsApi } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { formatDate, isOverdue, isDueToday, isDoneColumn, getPinnedBoardIds } from '../utils/helpers.js';

export default function Dashboard() {
  const { openMobileNav, openSearch } = useOutletContext() || {};
  const { user } = useAuth();
  const [boards, setBoards] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const pinnedIds = getPinnedBoardIds();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    boardsApi
      .list()
      .then(async (boardList) => {
        if (cancelled) return;
        setBoards(boardList);
        const details = await Promise.all(boardList.map((b) => boardsApi.get(b._id).catch(() => null)));
        if (cancelled) return;
        const tasks = details
          .filter(Boolean)
          .flatMap((d) => d.tasks.map((t) => ({ ...t, boardId: d.board._id, boardTitle: d.board.title })));
        setAllTasks(tasks);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const inProgressCount = allTasks.filter((t) => t.column.toLowerCase() === 'in progress').length;
  const overdueCount = allTasks.filter((t) => isOverdue(t.dueDate, t.column)).length;
  const dueTodayCount = allTasks.filter((t) => isDueToday(t.dueDate, t.column)).length;
  const upcoming = allTasks
    .filter((t) => t.dueDate && !isDoneColumn(t.column))
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 6);
  const pinnedBoards = boards.filter((b) => pinnedIds.includes(b._id));

  return (
    <div>
      <Topbar title={`Hi, ${user?.name?.split(' ')[0] || 'there'}`} onMenuClick={openMobileNav} onSearchClick={openSearch} />

      <div className="px-4 sm:px-6 py-6">
        {loading ? (
          <Spinner />
        ) : boards.length === 0 ? (
          <EmptyState
            title="Welcome to TaskFlow"
            description="Create your first board to start tracking tasks."
            action={
              <Link to="/boards" className="btn-primary">
                + Create a board
              </Link>
            }
          />
        ) : (
          <>
            {(overdueCount > 0 || dueTodayCount > 0) && (
              <Link
                to="/today"
                className="flex items-center justify-between gap-3 rounded-2xl bg-priority-high/10 text-priority-high px-5 py-3.5 mb-6 hover:bg-priority-high/15 transition-colors"
              >
                <span className="text-sm font-semibold">
                  {overdueCount > 0 && `${overdueCount} overdue`}
                  {overdueCount > 0 && dueTodayCount > 0 && ' · '}
                  {dueTodayCount > 0 && `${dueTodayCount} due today`}
                </span>
                <span className="text-sm font-semibold">View Today →</span>
              </Link>
            )}

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard label="Boards" value={boards.length} tint="bg-brand-500/10" color="text-brand-500" icon={<BoardIcon />} />
              <StatCard label="Total tasks" value={allTasks.length} tint="bg-blue-500/10" color="text-blue-500" icon={<ListIcon />} />
              <StatCard label="In progress" value={inProgressCount} tint="bg-priority-medium/10" color="text-priority-medium" icon={<ProgressIcon />} />
              <StatCard label="Overdue" value={overdueCount} tint="bg-priority-high/10" color="text-priority-high" icon={<ClockIcon />} />
            </div>

            {pinnedBoards.length > 0 && (
              <div className="mb-8">
                <h2 className="font-bold mb-3">Pinned boards</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pinnedBoards.map((b) => (
                    <Link key={b._id} to={`/boards/${b._id}`} className="card p-4 block hover:shadow-card transition-shadow">
                      <p className="font-semibold text-sm">{b.title}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <h2 className="font-bold mb-3">Your boards</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {boards.map((b) => {
                    const boardTasks = allTasks.filter((t) => t.boardId === b._id);
                    const boardDone = boardTasks.filter((t) => isDoneColumn(t.column)).length;
                    const progress = boardTasks.length ? Math.round((boardDone / boardTasks.length) * 100) : 0;
                    return (
                      <Link key={b._id} to={`/boards/${b._id}`} className="card p-4 block hover:shadow-card transition-shadow">
                        <p className="font-semibold text-sm mb-2">{b.title}</p>
                        <div className="flex items-center justify-between text-xs text-ink-400 mb-1.5">
                          <span>Progress</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-ink-100 dark:bg-ink-800 overflow-hidden">
                          <div className="h-full rounded-full bg-brand-gradient" style={{ width: `${progress}%` }} />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div>
                <h2 className="font-bold mb-3">Upcoming deadlines</h2>
                <div className="card divide-y divide-ink-100 dark:divide-ink-800">
                  {upcoming.length === 0 && (
                    <p className="text-sm text-ink-400 p-4">Nothing due soon.</p>
                  )}
                  {upcoming.map((t) => (
                    <Link key={t._id} to={`/boards/${t.boardId}`} className="p-3.5 flex items-center justify-between gap-3 hover:bg-ink-50 dark:hover:bg-ink-900">
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
    </div>
  );
}

function StatCard({ label, value, tint, color, icon }) {
  return (
    <div className="card p-4">
      <div className={`h-9 w-9 rounded-xl flex items-center justify-center mb-3 ${tint} ${color}`}>{icon}</div>
      <p className="text-2xl font-bold leading-none">{value}</p>
      <p className="text-xs text-ink-400 mt-1.5">{label}</p>
    </div>
  );
}

function BoardIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="4" width="18" height="16" rx="3" stroke="currentColor" strokeWidth="2" />
      <path d="M8 4v16M16 4v16" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
function ListIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function ProgressIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function ClockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M12 8v4l2.5 2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
