import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import Topbar from '../components/Topbar.jsx';
import KanbanColumn from '../components/KanbanColumn.jsx';
import TaskModal from '../components/TaskModal.jsx';
import BoardSettingsModal from '../components/BoardSettingsModal.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import Spinner from '../components/Spinner.jsx';
import PriorityBadge from '../components/PriorityBadge.jsx';
import { boardsApi, tasksApi } from '../api/client.js';
import { useToast } from '../context/ToastContext.jsx';
import {
  isDoneColumn,
  isOverdue,
  formatDate,
  sortTasks,
  getBoardPrefs,
  setBoardPrefs,
  downloadFile,
  tasksToCSV,
  getPinnedBoardIds,
  togglePinnedBoard,
} from '../utils/helpers.js';

export default function BoardDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { openMobileNav, openSearch } = useOutletContext() || {};
  const toast = useToast();
  const dragTaskRef = useRef(null);

  const prefs = getBoardPrefs(id);

  const [board, setBoard] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortMode, setSortMode] = useState(prefs.sortMode || 'manual');
  const [view, setView] = useState(prefs.view || 'board');
  const [pinned, setPinned] = useState(() => getPinnedBoardIds().includes(id));

  const [taskModal, setTaskModal] = useState({ open: false, column: null, task: null });
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteBoardOpen, setDeleteBoardOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkMoveTarget, setBulkMoveTarget] = useState('');
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  const load = () => {
    setLoading(true);
    boardsApi
      .get(id)
      .then((data) => {
        setBoard(data.board);
        setTasks(data.tasks);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  useEffect(() => {
    setBoardPrefs(id, { sortMode, view });
  }, [id, sortMode, view]);

  const filteredTasks = useMemo(() => {
    const filtered = tasks.filter((t) => {
      const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase());
      const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter;
      return matchesSearch && matchesPriority;
    });
    return sortTasks(filtered, sortMode);
  }, [tasks, search, priorityFilter, sortMode]);

  const tasksByColumn = (col) => filteredTasks.filter((t) => t.column === col);

  const handleAddTask = (column) => setTaskModal({ open: true, column, task: null });
  const handleEditTask = (task) => setTaskModal({ open: true, column: task.column, task });

  const handleSubmitTask = async (form) => {
    setSaving(true);
    try {
      if (taskModal.task) {
        const updated = await tasksApi.update(taskModal.task._id, form);
        setTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
        toast.success('Task updated');
      } else {
        const created = await tasksApi.create({ ...form, board: id });
        setTasks((prev) => [...prev, created]);
        toast.success('Task created');
      }
      setTaskModal({ open: false, column: null, task: null });
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleQuickAdd = async (column, title) => {
    try {
      const created = await tasksApi.create({ title, column, board: id, priority: 'medium' });
      setTasks((prev) => [...prev, created]);
    } catch (e) {
      toast.error(e.message);
    }
  };

  const handleDeleteTask = async () => {
    try {
      await tasksApi.remove(deleteTarget._id);
      setTasks((prev) => prev.filter((t) => t._id !== deleteTarget._id));
      toast.success('Task deleted');
    } catch (e) {
      toast.error(e.message);
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleDrop = async (task, targetColumn) => {
    dragTaskRef.current = null;
    if (task.column === targetColumn) return;

    const newOrder = tasksByColumn(targetColumn).length;
    setTasks((prev) =>
      prev.map((t) => (t._id === task._id ? { ...t, column: targetColumn, order: newOrder } : t))
    );

    try {
      await tasksApi.update(task._id, { column: targetColumn, order: newOrder });
    } catch (e) {
      toast.error(e.message);
      load();
    }
  };

  const handleToggleComplete = async (task) => {
    const doneCol = board.columns.find(isDoneColumn);
    if (!doneCol) {
      toast.error('Add a "Done" column in board settings to mark tasks complete');
      return;
    }
    const targetColumn = isDoneColumn(task.column) ? board.columns[0] : doneCol;
    setTasks((prev) => prev.map((t) => (t._id === task._id ? { ...t, column: targetColumn } : t)));
    try {
      await tasksApi.update(task._id, { column: targetColumn });
    } catch (e) {
      toast.error(e.message);
      load();
    }
  };

  const handleDeleteBoard = async () => {
    try {
      await boardsApi.remove(id);
      toast.success('Board deleted');
      navigate('/boards');
    } catch (e) {
      toast.error(e.message);
    }
  };

  const handleSaveSettings = async (payload) => {
    setSavingSettings(true);
    try {
      const updated = await boardsApi.update(id, payload);
      setBoard(updated);
      setSettingsOpen(false);
      toast.success('Board updated');
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleTogglePin = () => {
    const next = togglePinnedBoard(id);
    setPinned(next.includes(id));
  };

  const toggleSelect = (taskId) => {
    setSelectedIds((prev) => (prev.includes(taskId) ? prev.filter((i) => i !== taskId) : [...prev, taskId]));
  };

  const exitSelectMode = () => {
    setSelectMode(false);
    setSelectedIds([]);
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedIds.map((tid) => tasksApi.remove(tid)));
      setTasks((prev) => prev.filter((t) => !selectedIds.includes(t._id)));
      toast.success(`${selectedIds.length} task(s) deleted`);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBulkDeleteOpen(false);
      exitSelectMode();
    }
  };

  const handleBulkMove = async () => {
    if (!bulkMoveTarget) return;
    try {
      await Promise.all(selectedIds.map((tid) => tasksApi.update(tid, { column: bulkMoveTarget })));
      setTasks((prev) => prev.map((t) => (selectedIds.includes(t._id) ? { ...t, column: bulkMoveTarget } : t)));
      toast.success(`Moved to ${bulkMoveTarget}`);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBulkMoveTarget('');
      exitSelectMode();
    }
  };

  const handleExport = (format) => {
    if (format === 'csv') {
      downloadFile(`${board.title.replace(/\s+/g, '_')}.csv`, tasksToCSV(filteredTasks), 'text/csv');
    } else {
      downloadFile(`${board.title.replace(/\s+/g, '_')}.json`, JSON.stringify(filteredTasks, null, 2), 'application/json');
    }
  };

  if (loading) {
    return (
      <div>
        <Topbar title="Loading…" onMenuClick={openMobileNav} />
        <Spinner />
      </div>
    );
  }

  if (error || !board) {
    return (
      <div>
        <Topbar title="Board" onMenuClick={openMobileNav} />
        <p className="p-6 text-priority-high text-sm">{error || 'Board not found'}</p>
      </div>
    );
  }

  return (
    <div>
      <Topbar
        title={board.title}
        onMenuClick={openMobileNav}
        onSearchClick={openSearch}
        right={
          <div className="flex items-center gap-2">
            <button onClick={handleTogglePin} className="rounded-xl p-2.5 bg-ink-50 dark:bg-ink-900 hover:bg-ink-100 dark:hover:bg-ink-800" aria-label="Pin board">
              <svg width="16" height="16" viewBox="0 0 24 24" fill={pinned ? 'currentColor' : 'none'} className={pinned ? 'text-brand-500' : 'text-ink-400'}>
                <path d="M12 2l2.5 6.5L21 10l-5 4.5L17.5 21 12 17.5 6.5 21 8 14.5 3 10l6.5-1.5L12 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              </svg>
            </button>
            <button className="btn-ghost" onClick={() => setSettingsOpen(true)}>
              Settings
            </button>
            <button className="btn-ghost !text-priority-high" onClick={() => setDeleteBoardOpen(true)}>
              Delete
            </button>
          </div>
        }
      />

      <div className="px-4 sm:px-6 py-6">
        {board.description && <p className="text-sm text-ink-400 mb-5 max-w-2xl">{board.description}</p>}

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <input
            className="input max-w-xs"
            placeholder="Search tasks…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select className="input w-auto" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
            <option value="all">All priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <select className="input w-auto" value={sortMode} onChange={(e) => setSortMode(e.target.value)}>
            <option value="manual">Sort: Manual</option>
            <option value="priority">Sort: Priority</option>
            <option value="dueDate">Sort: Due date</option>
            <option value="newest">Sort: Newest</option>
          </select>

          <div className="flex items-center gap-1 bg-ink-100 dark:bg-ink-900 rounded-xl p-1 ml-auto">
            <button
              onClick={() => setView('board')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                view === 'board' ? 'bg-white dark:bg-ink-800 shadow-soft' : 'text-ink-400'
              }`}
            >
              Board
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                view === 'list' ? 'bg-white dark:bg-ink-800 shadow-soft' : 'text-ink-400'
              }`}
            >
              List
            </button>
          </div>

          <div className="relative group">
            <button className="btn-ghost">Export ▾</button>
            <div className="absolute right-0 top-full mt-1 w-32 card p-1 shadow-card opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity z-20">
              <button className="w-full text-left text-xs px-2.5 py-2 rounded-lg hover:bg-ink-50 dark:hover:bg-ink-800" onClick={() => handleExport('csv')}>
                Export CSV
              </button>
              <button className="w-full text-left text-xs px-2.5 py-2 rounded-lg hover:bg-ink-50 dark:hover:bg-ink-800" onClick={() => handleExport('json')}>
                Export JSON
              </button>
            </div>
          </div>

          {selectMode ? (
            <button className="btn-ghost" onClick={exitSelectMode}>
              Cancel select
            </button>
          ) : (
            <button className="btn-ghost" onClick={() => setSelectMode(true)}>
              Select
            </button>
          )}
        </div>

        {/* Bulk actions bar */}
        {selectMode && selectedIds.length > 0 && (
          <div className="flex items-center gap-3 mb-5 card px-4 py-3 bg-brand-50 dark:bg-brand-900/20">
            <span className="text-sm font-semibold">{selectedIds.length} selected</span>
            <select className="input w-auto py-1.5" value={bulkMoveTarget} onChange={(e) => setBulkMoveTarget(e.target.value)}>
              <option value="">Move to…</option>
              {board.columns.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <button className="btn-ghost text-xs" onClick={handleBulkMove} disabled={!bulkMoveTarget}>
              Move
            </button>
            <button className="btn-danger text-xs ml-auto" onClick={() => setBulkDeleteOpen(true)}>
              Delete selected
            </button>
          </div>
        )}

        {view === 'board' ? (
          <div className="flex gap-5 overflow-x-auto pb-4">
            {board.columns.map((col) => (
              <KanbanColumn
                key={col}
                column={col}
                tasks={tasksByColumn(col)}
                onDrop={handleDrop}
                onAddTask={handleAddTask}
                onQuickAdd={handleQuickAdd}
                onEditTask={handleEditTask}
                onDeleteTask={setDeleteTarget}
                onToggleComplete={handleToggleComplete}
                dragTaskRef={dragTaskRef}
                selectMode={selectMode}
                selectedIds={selectedIds}
                onToggleSelect={toggleSelect}
              />
            ))}
          </div>
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-ink-50 dark:bg-ink-900 text-ink-400 text-xs uppercase">
                <tr>
                  <th className="text-left font-semibold px-4 py-3">Title</th>
                  <th className="text-left font-semibold px-4 py-3">Column</th>
                  <th className="text-left font-semibold px-4 py-3">Priority</th>
                  <th className="text-left font-semibold px-4 py-3">Due date</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100 dark:divide-ink-800">
                {filteredTasks.map((t) => (
                  <tr key={t._id} className="hover:bg-ink-50 dark:hover:bg-ink-900">
                    <td className="px-4 py-3 font-medium">{t.title}</td>
                    <td className="px-4 py-3 text-ink-400">{t.column}</td>
                    <td className="px-4 py-3">
                      <PriorityBadge priority={t.priority} />
                    </td>
                    <td className={`px-4 py-3 ${isOverdue(t.dueDate, t.column) ? 'text-priority-high' : 'text-ink-400'}`}>
                      {t.dueDate ? formatDate(t.dueDate) : '—'}
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button className="text-brand-500 text-xs font-semibold" onClick={() => handleEditTask(t)}>
                        Edit
                      </button>
                      <button className="text-priority-high text-xs font-semibold" onClick={() => setDeleteTarget(t)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredTasks.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-ink-400">
                      No tasks match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <TaskModal
        open={taskModal.open}
        onClose={() => setTaskModal({ open: false, column: null, task: null })}
        onSubmit={handleSubmitTask}
        columns={board.columns}
        initial={taskModal.task}
        defaultColumn={taskModal.column}
        submitting={saving}
      />

      <BoardSettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onSubmit={handleSaveSettings}
        board={board}
        submitting={savingSettings}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteTask}
        title="Delete task"
        message={`Delete "${deleteTarget?.title}"? This can't be undone.`}
      />

      <ConfirmDialog
        open={deleteBoardOpen}
        onClose={() => setDeleteBoardOpen(false)}
        onConfirm={handleDeleteBoard}
        title="Delete board"
        message={`Delete "${board.title}" and all its tasks? This can't be undone.`}
      />

      <ConfirmDialog
        open={bulkDeleteOpen}
        onClose={() => setBulkDeleteOpen(false)}
        onConfirm={handleBulkDelete}
        title="Delete selected tasks"
        message={`Delete ${selectedIds.length} task(s)? This can't be undone.`}
      />
    </div>
  );
}
