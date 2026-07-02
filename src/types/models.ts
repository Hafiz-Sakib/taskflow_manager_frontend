export type Priority = 'low' | 'medium' | 'high';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: string;
}

export interface Workspace {
  _id: string;
  name: string;
  owner: string;
  createdAt: string;
  updatedAt: string;
}

export interface Board {
  _id: string;
  title: string;
  description: string;
  owner: string;
  workspace: string | null;
  columns: string[];
  isArchived: boolean;
  taskCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChecklistItem {
  _id: string;
  text: string;
  done: boolean;
}

export interface Comment {
  _id: string;
  author: { _id: string; name: string; email: string } | string;
  text: string;
  createdAt: string;
}

export interface Attachment {
  _id: string;
  name: string;
  url: string;
  addedBy: string;
  createdAt: string;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  board: string;
  column: string;
  priority: Priority;
  labels: string[];
  order: number;
  dueDate: string | null;
  isArchived: boolean;
  comments: Comment[];
  checklist: ChecklistItem[];
  attachments: Attachment[];
  createdAt: string;
  updatedAt: string;
}

export interface BoardWithTasks {
  board: Board;
  tasks: Task[];
}

export interface ActivityLogEntry {
  _id: string;
  user: { _id: string; name: string; email: string };
  board: string;
  task: string | null;
  action: string;
  meta: Record<string, unknown>;
  createdAt: string;
}

export interface AppNotification {
  _id: string;
  user: string;
  task: string;
  board: string;
  type: 'due_today' | 'overdue';
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface DashboardStats {
  boardCount: number;
  totalTasks: number;
  tasksByPriority: Record<string, number>;
  tasksByColumn: Record<string, number>;
  overdueCount: number;
  completionRate: number;
}
