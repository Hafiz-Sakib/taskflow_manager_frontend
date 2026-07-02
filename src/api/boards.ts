import { api } from './axios';
import type { ApiSuccess } from '@/types/api';
import type { Board, BoardWithTasks, ActivityLogEntry } from '@/types/models';

export interface CreateBoardPayload {
  title: string;
  description?: string;
  columns?: string[];
  workspace?: string;
}

export interface UpdateBoardPayload {
  title?: string;
  description?: string;
  columns?: string[];
}

export const boardsApi = {
  list: async (includeArchived = false) => {
    const res = await api.get<ApiSuccess<Board[]>>('/boards', { params: { includeArchived } });
    return res.data.data;
  },
  get: async (id: string) => {
    const res = await api.get<ApiSuccess<BoardWithTasks>>(`/boards/${id}`);
    return res.data.data;
  },
  create: async (payload: CreateBoardPayload) => {
    const res = await api.post<ApiSuccess<Board>>('/boards', payload);
    return res.data.data;
  },
  update: async (id: string, payload: UpdateBoardPayload) => {
    const res = await api.put<ApiSuccess<Board>>(`/boards/${id}`, payload);
    return res.data.data;
  },
  archive: async (id: string, isArchived: boolean) => {
    const res = await api.patch<ApiSuccess<Board>>(`/boards/${id}/archive`, { isArchived });
    return res.data.data;
  },
  remove: async (id: string) => {
    await api.delete(`/boards/${id}`);
  },
  activity: async (id: string, page = 1) => {
    const res = await api.get<ApiSuccess<{ items: ActivityLogEntry[] }>>(`/boards/${id}/activity`, {
      params: { page },
    });
    return res.data.data;
  },
};
