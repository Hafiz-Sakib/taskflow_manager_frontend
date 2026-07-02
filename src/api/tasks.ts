import { api } from './axios';
import type { ApiSuccess, Paginated } from '@/types/api';
import type { Task, Priority } from '@/types/models';

export interface CreateTaskPayload {
  title: string;
  description?: string;
  board: string;
  column?: string;
  priority?: Priority;
  labels?: string[];
  dueDate?: string | null;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  column?: string;
  priority?: Priority;
  labels?: string[];
  order?: number;
  dueDate?: string | null;
  isArchived?: boolean;
  board?: string;
}

export interface TaskFilters {
  board?: string;
  search?: string;
  priority?: Priority;
  column?: string;
  isArchived?: boolean;
  sort?: 'manual' | 'priority' | 'dueDate' | 'newest';
  page?: number;
  limit?: number;
}

export const tasksApi = {
  list: async (filters: TaskFilters = {}) => {
    const res = await api.get<ApiSuccess<Paginated<Task>>>('/tasks', { params: filters });
    return res.data.data;
  },
  create: async (payload: CreateTaskPayload) => {
    const res = await api.post<ApiSuccess<Task>>('/tasks', payload);
    return res.data.data;
  },
  update: async (id: string, payload: UpdateTaskPayload) => {
    const res = await api.put<ApiSuccess<Task>>(`/tasks/${id}`, payload);
    return res.data.data;
  },
  archive: async (id: string, isArchived: boolean) => {
    const res = await api.patch<ApiSuccess<Task>>(`/tasks/${id}/archive`, { isArchived });
    return res.data.data;
  },
  remove: async (id: string) => {
    await api.delete(`/tasks/${id}`);
  },
  reorder: async (tasks: { _id: string; column: string; order: number }[]) => {
    await api.put('/tasks/reorder/bulk', { tasks });
  },
  addComment: async (id: string, text: string) => {
    const res = await api.post<ApiSuccess<Task>>(`/tasks/${id}/comments`, { text });
    return res.data.data;
  },
  addAttachment: async (id: string, payload: { name: string; url: string }) => {
    const res = await api.post<ApiSuccess<Task>>(`/tasks/${id}/attachments`, payload);
    return res.data.data;
  },
  addChecklistItem: async (id: string, text: string) => {
    const res = await api.post<ApiSuccess<Task>>(`/tasks/${id}/checklist`, { text });
    return res.data.data;
  },
  toggleChecklistItem: async (id: string, itemId: string, done: boolean) => {
    const res = await api.patch<ApiSuccess<Task>>(`/tasks/${id}/checklist/${itemId}`, { done });
    return res.data.data;
  },
  removeChecklistItem: async (id: string, itemId: string) => {
    const res = await api.delete<ApiSuccess<Task>>(`/tasks/${id}/checklist/${itemId}`);
    return res.data.data;
  },
};
