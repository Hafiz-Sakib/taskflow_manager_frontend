import { useEffect, useState } from 'react';
import Modal from './Modal.jsx';

export default function BoardSettingsModal({ open, onClose, onSubmit, board, submitting }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [columns, setColumns] = useState([]);
  const [newColumn, setNewColumn] = useState('');

  useEffect(() => {
    if (board) {
      setTitle(board.title);
      setDescription(board.description || '');
      setColumns(board.columns);
    }
  }, [board, open]);

  const updateColumn = (idx, value) => {
    setColumns((prev) => prev.map((c, i) => (i === idx ? value : c)));
  };

  const removeColumn = (idx) => {
    setColumns((prev) => prev.filter((_, i) => i !== idx));
  };

  const addColumn = () => {
    if (!newColumn.trim()) return;
    setColumns((prev) => [...prev, newColumn.trim()]);
    setNewColumn('');
  };

  const moveColumn = (idx, dir) => {
    setColumns((prev) => {
      const next = [...prev];
      const target = idx + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanColumns = columns.map((c) => c.trim()).filter(Boolean);
    if (cleanColumns.length === 0) return;
    onSubmit({ title, description, columns: cleanColumns });
  };

  return (
    <Modal open={open} onClose={onClose} title="Board settings">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-ink-500 mb-1.5">Title</label>
          <input required className="input" maxLength={100} value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink-500 mb-1.5">Description</label>
          <textarea
            className="input min-h-[70px] resize-y"
            maxLength={300}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink-500 mb-1.5">Columns</label>
          <div className="space-y-2">
            {columns.map((c, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <input
                  className="input flex-1"
                  value={c}
                  onChange={(e) => updateColumn(idx, e.target.value)}
                />
                <button type="button" onClick={() => moveColumn(idx, -1)} className="rounded-lg p-2 hover:bg-ink-50 dark:hover:bg-ink-800 text-ink-400" aria-label="Move up">
                  ↑
                </button>
                <button type="button" onClick={() => moveColumn(idx, 1)} className="rounded-lg p-2 hover:bg-ink-50 dark:hover:bg-ink-800 text-ink-400" aria-label="Move down">
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => removeColumn(idx)}
                  className="rounded-lg p-2 hover:bg-priority-high/10 text-priority-high"
                  aria-label="Remove column"
                  disabled={columns.length <= 1}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-2">
            <input
              className="input flex-1"
              placeholder="New column name"
              value={newColumn}
              onChange={(e) => setNewColumn(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addColumn();
                }
              }}
            />
            <button type="button" className="btn-ghost" onClick={addColumn}>
              Add
            </button>
          </div>
          <p className="text-xs text-ink-400 mt-1.5">
            Renaming a column moves its tasks automatically. Removing a column here does not delete its tasks from
            the server — move tasks out first.
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" className="btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
