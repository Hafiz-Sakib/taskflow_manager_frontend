import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { boardsApi } from '../api/client.js';
import PriorityBadge from './PriorityBadge.jsx';

export default function GlobalSearchModal({ open, onClose }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [allTasks, setAllTasks] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setQuery('');
    setTimeout(() => inputRef.current?.focus(), 30);
    if (allTasks === null) {
      boardsApi.list().then(async (boards) => {
        const details = await Promise.all(boards.map((b) => boardsApi.get(b._id).catch(() => null)));
        const tasks = details
          .filter(Boolean)
          .flatMap((d) => d.tasks.map((t) => ({ ...t, boardId: d.board._id, boardTitle: d.board.title })));
        setAllTasks(tasks);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const results = (allTasks || []).filter((t) => t.title.toLowerCase().includes(query.toLowerCase())).slice(0, 20);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg card overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-ink-100 dark:border-ink-800">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-ink-400 shrink-0">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
            <path d="M21 21l-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            ref={inputRef}
            className="flex-1 bg-transparent outline-none text-sm"
            placeholder="Search tasks across all boards…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <kbd className="text-[10px] text-ink-400 bg-ink-50 dark:bg-ink-800 rounded px-1.5 py-0.5">Esc</kbd>
        </div>

        <div className="max-h-80 overflow-y-auto">
          {allTasks === null && <p className="text-sm text-ink-400 p-4">Loading…</p>}
          {allTasks !== null && query && results.length === 0 && (
            <p className="text-sm text-ink-400 p-4">No tasks match "{query}".</p>
          )}
          {allTasks !== null && !query && (
            <p className="text-xs text-ink-400 p-4">Type to search tasks by title.</p>
          )}
          {results.map((t) => (
            <button
              key={t._id}
              onClick={() => {
                navigate(`/boards/${t.boardId}`);
                onClose();
              }}
              className="w-full text-left flex items-center justify-between gap-3 px-4 py-3 hover:bg-ink-50 dark:hover:bg-ink-800 border-b border-ink-100 dark:border-ink-800 last:border-0"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{t.title}</p>
                <p className="text-xs text-ink-400">
                  {t.boardTitle} · {t.column}
                </p>
              </div>
              <PriorityBadge priority={t.priority} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
