import { useEffect, useMemo, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import Topbar from '../components/Topbar.jsx';
import Modal from '../components/Modal.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Spinner from '../components/Spinner.jsx';
import { boardsApi } from '../api/client.js';
import { useToast } from '../context/ToastContext.jsx';
import { formatDate, getPinnedBoardIds, togglePinnedBoard, isDoneColumn } from '../utils/helpers.js';

const COLORS = ['#6d5dfc', '#ef4d8b', '#28c281', '#f5a15c', '#3b6cf6', '#b13bde'];

export default function Boards() {
  const { openMobileNav, openSearch } = useOutletContext() || {};
  const toast = useToast();
  const [boards, setBoards] = useState([]);
  const [taskCounts, setTaskCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', columns: 'To Do, In Progress, Done' });
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [pinnedIds, setPinnedIds] = useState(getPinnedBoardIds());

  const load = () => {
    setLoading(true);
    boardsApi
      .list()
      .then(async (list) => {
        setBoards(list);
        const details = await Promise.all(list.map((b) => boardsApi.get(b._id).catch(() => null)));
        const counts = {};
        details.filter(Boolean).forEach((d) => {
          const done = d.tasks.filter((t) => isDoneColumn(t.column)).length;
          counts[d.board._id] = { total: d.tasks.length, done };
        });
        setTaskCounts(counts);
      })
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const { pinnedBoards, otherBoards } = useMemo(() => {
    const pinned = boards.filter((b) => pinnedIds.includes(b._id));
    const others = boards.filter((b) => !pinnedIds.includes(b._id));
    return { pinnedBoards: pinned, otherBoards: others };
  }, [boards, pinnedIds]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const columns = form.columns
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean);
      const created = await boardsApi.create({ ...form, columns: columns.length ? columns : undefined });
      setBoards((prev) => [created, ...prev]);
      setCreateOpen(false);
      setForm({ title: '', description: '', columns: 'To Do, In Progress, Done' });
      toast.success('Board created');
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await boardsApi.remove(deleteTarget._id);
      setBoards((prev) => prev.filter((b) => b._id !== deleteTarget._id));
      toast.success('Board deleted');
    } catch (e) {
      toast.error(e.message);
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleTogglePin = (boardId) => {
    setPinnedIds(togglePinnedBoard(boardId));
  };

  const renderBoard = (b, i) => {
    const counts = taskCounts[b._id];
    const progress = counts && counts.total ? Math.round((counts.done / counts.total) * 100) : 0;
    const isPinned = pinnedIds.includes(b._id);
    return (
      <div key={b._id} className="card p-5 group relative">
        <div className="flex items-center justify-between mb-4">
          <div className="h-1.5 w-10 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
          <button
            onClick={() => handleTogglePin(b._id)}
            className="text-ink-300 hover:text-brand-500"
            aria-label={isPinned ? 'Unpin board' : 'Pin board'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill={isPinned ? 'currentColor' : 'none'} className={isPinned ? 'text-brand-500' : ''}>
              <path d="M12 2l2.5 6.5L21 10l-5 4.5L17.5 21 12 17.5 6.5 21 8 14.5 3 10l6.5-1.5L12 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        <Link to={`/boards/${b._id}`} className="block">
          <h3 className="font-bold mb-1 pr-6">{b.title}</h3>
          {b.description && <p className="text-sm text-ink-400 line-clamp-2 mb-4">{b.description}</p>}
        </Link>

        {counts && counts.total > 0 && (
          <div className="mb-3">
            <div className="flex justify-between text-xs text-ink-400 mb-1">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-ink-100 dark:bg-ink-800 overflow-hidden">
              <div className="h-full rounded-full bg-brand-gradient" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-ink-400">
          <span>{b.columns.length} columns · {counts?.total ?? 0} tasks</span>
          <span>{formatDate(b.createdAt)}</span>
        </div>
        <button
          onClick={() => setDeleteTarget(b)}
          className="absolute top-5 right-12 opacity-0 group-hover:opacity-100 text-ink-400 hover:text-priority-high transition-opacity"
          aria-label="Delete board"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    );
  };

  return (
    <div>
      <Topbar
        title="Boards"
        onMenuClick={openMobileNav}
        onSearchClick={openSearch}
        right={
          <button className="btn-primary" onClick={() => setCreateOpen(true)}>
            + New board
          </button>
        }
      />

      <div className="px-4 sm:px-6 py-6">
        {loading ? (
          <Spinner />
        ) : boards.length === 0 ? (
          <EmptyState
            title="No boards yet"
            description="Create your first board to start organizing tasks into columns."
            action={
              <button className="btn-primary" onClick={() => setCreateOpen(true)}>
                + Create a board
              </button>
            }
          />
        ) : (
          <>
            {pinnedBoards.length > 0 && (
              <div className="mb-8">
                <h2 className="font-bold text-sm text-ink-400 uppercase tracking-wide mb-3">Pinned</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {pinnedBoards.map(renderBoard)}
                </div>
              </div>
            )}
            <div>
              {pinnedBoards.length > 0 && (
                <h2 className="font-bold text-sm text-ink-400 uppercase tracking-wide mb-3">All boards</h2>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {otherBoards.map(renderBoard)}
              </div>
            </div>
          </>
        )}
      </div>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create board">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink-500 mb-1.5">Title</label>
            <input
              required
              className="input"
              maxLength={100}
              placeholder="e.g. Website Redesign"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-500 mb-1.5">Description</label>
            <textarea
              className="input min-h-[80px] resize-y"
              maxLength={300}
              placeholder="What's this board for? (optional)"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-500 mb-1.5">Columns</label>
            <input
              className="input"
              placeholder="To Do, In Progress, Done"
              value={form.columns}
              onChange={(e) => setForm({ ...form, columns: e.target.value })}
            />
            <p className="text-xs text-ink-400 mt-1.5">Comma-separated list of column names</p>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-ghost" onClick={() => setCreateOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Creating…' : 'Create board'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete board"
        message={`Delete "${deleteTarget?.title}" and all its tasks? This can't be undone.`}
      />
    </div>
  );
}
