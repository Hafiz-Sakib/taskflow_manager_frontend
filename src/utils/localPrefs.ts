import type { Task } from '@/types/models';

const PIN_KEY = 'taskflow-pinned-boards';

export function getPinnedBoardIds(): string[] {
  try {
    return JSON.parse(localStorage.getItem(PIN_KEY) || '[]');
  } catch {
    return [];
  }
}

export function togglePinnedBoard(boardId: string): string[] {
  const pinned = getPinnedBoardIds();
  const next = pinned.includes(boardId) ? pinned.filter((id) => id !== boardId) : [...pinned, boardId];
  localStorage.setItem(PIN_KEY, JSON.stringify(next));
  return next;
}

const RECENT_TASKS_KEY = 'taskflow-recent-tasks';
const MAX_RECENT_TASKS = 8;

export function trackRecentTask(taskId: string) {
  const existing = getRecentTaskIds().filter((id) => id !== taskId);
  const next = [taskId, ...existing].slice(0, MAX_RECENT_TASKS);
  localStorage.setItem(RECENT_TASKS_KEY, JSON.stringify(next));
}

export function getRecentTaskIds(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_TASKS_KEY) || '[]');
  } catch {
    return [];
  }
}

export function getBoardPrefs(boardId: string): { sort?: string; view?: string; collapsed?: string[] } {
  try {
    return JSON.parse(localStorage.getItem(`taskflow-board-prefs-${boardId}`) || '{}');
  } catch {
    return {};
  }
}

export function setBoardPrefs(boardId: string, prefs: Record<string, unknown>) {
  localStorage.setItem(`taskflow-board-prefs-${boardId}`, JSON.stringify(prefs));
}

export function downloadFile(filename: string, content: string, mime: string) {
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

export function tasksToCSV(tasks: Task[]): string {
  const headers = ['Title', 'Description', 'Column', 'Priority', 'Due Date'];
  const rows = tasks.map((t) => [
    t.title,
    (t.description || '').replace(/\n/g, ' '),
    t.column,
    t.priority,
    t.dueDate ? t.dueDate.slice(0, 10) : '',
  ]);
  const escape = (v: string) => `"${String(v).replace(/"/g, '""')}"`;
  return [headers, ...rows].map((r) => r.map(escape).join(',')).join('\n');
}
