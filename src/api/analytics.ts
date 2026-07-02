import { api } from './axios';
import type { ApiSuccess } from '@/types/api';
import type { DashboardStats, Board } from '@/types/models';

export const analyticsApi = {
  dashboard: async () => {
    const res = await api.get<ApiSuccess<DashboardStats>>('/analytics/dashboard');
    return res.data.data;
  },
  boardStats: async (boardId: string) => {
    const res = await api.get<
      ApiSuccess<{ totalTasks: number; tasksByPriority: Record<string, number>; tasksByColumn: Record<string, number> }>
    >(`/analytics/boards/${boardId}`);
    return res.data.data;
  },
  recent: async () => {
    const res = await api.get<ApiSuccess<{ board: Board; viewedAt: string }[]>>('/analytics/recent');
    return res.data.data;
  },
};
