export function formatDate(dateStr, opts = {}) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...opts,
  });
}

export function isOverdue(dateStr, column) {
  if (!dateStr || isDoneColumn(column)) return false;
  return new Date(dateStr) < new Date(new Date().toDateString());
}

export function isDueSoon(dateStr, column) {
  if (!dateStr || isDoneColumn(column)) return false;
  const due = new Date(dateStr);
  const today = new Date(new Date().toDateString());
  const diffDays = (due - today) / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= 2;
}

export const PRIORITY_META = {
  low: { label: 'Low', color: '#28c281', bg: 'bg-priority-low/10', text: 'text-priority-low' },
  medium: { label: 'Medium', color: '#f5a15c', bg: 'bg-priority-medium/10', text: 'text-priority-medium' },
  high: { label: 'High', color: '#ef4d6b', bg: 'bg-priority-high/10', text: 'text-priority-high' },
};

export function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('');
}

export function sameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isDueToday(dateStr, column) {
  if (!dateStr || isDoneColumn(column)) return false;
  return sameDay(new Date(dateStr), new Date());
}

export function isDoneColumn(column = '') {
  return column.trim().toLowerCase() === 'done';
}

// ---------- Pinned boards (client-side only) ----------
const PIN_KEY = 'taskflow_pinned_boards';

export function getPinnedBoardIds() {
  try {
    return JSON.parse(localStorage.getItem(PIN_KEY)) || [];
  } catch {
    return [];
  }
}

export function togglePinnedBoard(boardId) {
  const pinned = getPinnedBoardIds();
  const next = pinned.includes(boardId) ? pinned.filter((id) => id !== boardId) : [...pinned, boardId];
  localStorage.setItem(PIN_KEY, JSON.stringify(next));
  return next;
}

// ---------- Per-board view preferences (sort / filter / layout) ----------
export function getBoardPrefs(boardId) {
  try {
    return JSON.parse(localStorage.getItem(`taskflow_board_prefs_${boardId}`)) || {};
  } catch {
    return {};
  }
}

export function setBoardPrefs(boardId, prefs) {
  localStorage.setItem(`taskflow_board_prefs_${boardId}`, JSON.stringify(prefs));
}

// ---------- Export helpers ----------
export function downloadFile(filename, content, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function tasksToCSV(tasks) {
  const headers = ['Title', 'Description', 'Column', 'Priority', 'Due Date'];
  const rows = tasks.map((t) => [
    t.title,
    (t.description || '').replace(/\n/g, ' '),
    t.column,
    t.priority,
    t.dueDate ? t.dueDate.slice(0, 10) : '',
  ]);
  const escape = (v) => `"${String(v).replace(/"/g, '""')}"`;
  return [headers, ...rows].map((r) => r.map(escape).join(',')).join('\n');
}

export function sortTasks(tasks, mode) {
  const arr = [...tasks];
  const priorityRank = { high: 0, medium: 1, low: 2 };
  switch (mode) {
    case 'priority':
      return arr.sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority]);
    case 'dueDate':
      return arr.sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      });
    case 'newest':
      return arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    default:
      return arr.sort((a, b) => a.order - b.order);
  }
}
