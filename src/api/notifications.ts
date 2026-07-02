import { api } from './axios';
import type { ApiSuccess, Paginated } from '@/types/api';
import type { AppNotification } from '@/types/models';

export const notificationsApi = {
  list: async (page = 1) => {
    const res = await api.get<ApiSuccess<Paginated<AppNotification> & { unreadCount: number }>>('/notifications', {
      params: { page },
    });
    return res.data.data;
  },
  markRead: async (id: string) => {
    const res = await api.patch<ApiSuccess<AppNotification>>(`/notifications/${id}/read`);
    return res.data.data;
  },
  markAllRead: async () => {
    await api.patch('/notifications/read-all');
  },
};
