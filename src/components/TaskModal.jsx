import { useEffect, useState } from 'react';
import Modal from './Modal.jsx';

const emptyForm = { title: '', description: '', priority: 'medium', column: '', dueDate: '' };

export default function TaskModal({ open, onClose, onSubmit, columns = [], initial, defaultColumn, submitting }) {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (initial) {
      setForm({
        title: initial.title || '',
        description: initial.description || '',
        priority: initial.priority || 'medium',
        column: initial.column || columns[0] || '',
        dueDate: initial.dueDate ? initial.dueDate.slice(0, 10) : '',
      });
    } else {
      setForm({ ...emptyForm, column: defaultColumn || columns[0] || '' });
    }
  }, [initial, open, columns, defaultColumn]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...form,
      dueDate: form.dueDate || null,
    });
  };

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Edit task' : 'New task'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-ink-500 mb-1.5">Title</label>
          <input
            required
            className="input"
            maxLength={150}
            placeholder="e.g. Design landing page hero"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink-500 mb-1.5">Description</label>
          <textarea
            className="input min-h-[90px] resize-y"
            maxLength={1000}
            placeholder="Add more detail (optional)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-ink-500 mb-1.5">Column</label>
            <select
              className="input"
              value={form.column}
              onChange={(e) => setForm({ ...form, column: e.target.value })}
            >
              {columns.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-500 mb-1.5">Priority</label>
            <select
              className="input"
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-ink-500 mb-1.5">Due date</label>
          <input
            type="date"
            className="input"
            value={form.dueDate}
            onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" className="btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Saving…' : initial ? 'Save changes' : 'Create task'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
