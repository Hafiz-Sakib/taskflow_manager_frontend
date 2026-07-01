import { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import Topbar from '../components/Topbar.jsx';
import Spinner from '../components/Spinner.jsx';
import EmptyState from '../components/EmptyState.jsx';
import PriorityBadge from '../components/PriorityBadge.jsx';
import { boardsApi, tasksApi } from '../api/client.js';
import { useToast } from '../context/ToastContext.jsx';
import { isOverdue, isDueToday, isDoneColumn, formatDate } from '../utils/helpers.js';

export default function Today() {
  const { openMobileNav, openSearch } = useOutletContext() || {};
  const toast = useToast();
  const [items, setItems] = useState(null);

  const load = () => {
    boardsApi.list().then(async (boards) => {
      const details = await Promise.all(boards.map((b) => boardsApi.get(b._id).catch(() => null)));
      const rows = details
        .filter(Boolean)
        .flatMap((d) =>
          d.tasks
            .filter((t) => (isOverdue(t.dueDate, t.column) || isDueToday(t.dueDate, t.column)))
            .map((t) => ({ ...t, boardId: d.board._id, boardTitle: d.board.title, boardColumns: d.board.columns }))
        )
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
      setItems(rows);
    });
  };

  useEffect(load, []);

  const toggleComplete = async (task) => {
    const doneCol = task.boardColumns.find(isDoneColumn);
    if (!doneCol) {
      toast.error('This board has no "Done" column to complete into');
      return;
    }
    setItems((prev) => prev.filter((t) => t._id !== task._id));
    try {
      await tasksApi.update(task._id, { column: doneCol });
      toast.success('Task completed');
    } catch (e) {
      toast.error(e.message);
      load();
    }
  };

  return (
    <div>
      <Topbar title="Today" onMenuClick={openMobileNav} onSearchClick={openSearch} />

      <div className="px-4 sm:px-6 py-6">
        {items === null ? (
          <Spinner />
        ) : items.length === 0 ? (
          <EmptyState title="You're all caught up" description="Nothing overdue or due today." />
        ) : (
          <div className="card divide-y divide-ink-100 dark:divide-ink-800 max-w-2xl">
            {items.map((t) => {
              const overdue = isOverdue(t.dueDate, t.column);
              return (
                <div key={t._id} className="flex items-start gap-3 p-4">
                  <button
                    onClick={() => toggleComplete(t)}
                    className="mt-0.5 h-[18px] w-[18px] shrink-0 rounded-md border-2 border-ink-300 dark:border-ink-600 hover:border-brand-500"
                    aria-label="Mark complete"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{t.title}</p>
                    <p className="text-xs text-ink-400 mt-0.5">
                      <Link to={`/boards/${t.boardId}`} className="hover:text-brand-500">
                        {t.boardTitle}
                      </Link>{' '}
                      · {t.column}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <PriorityBadge priority={t.priority} />
                    <span className={`text-xs font-medium ${overdue ? 'text-priority-high' : 'text-ink-400'}`}>
                      {overdue ? 'Overdue' : 'Today'} · {formatDate(t.dueDate, { year: undefined })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
