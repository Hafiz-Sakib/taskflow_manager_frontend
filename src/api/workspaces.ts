import { api } from './axios';
import type { ApiSuccess } from '@/types/api';
import type { Workspace } from '@/types/models';

export const workspacesApi = {
  list: async () => {
    const res = await api.get<ApiSuccess<Workspace[]>>('/workspaces');
    return res.data.data;
  },
  create: async (name: string) => {
    const res = await api.post<ApiSuccess<Workspace>>('/workspaces', { name });
    return res.data.data;
  },
  update: async (id: string, name: string) => {
    const res = await api.put<ApiSuccess<Workspace>>(`/workspaces/${id}`, { name });
    return res.data.data;
  },
  remove: async (id: string) => {
    await api.delete(`/workspaces/${id}`);
  },
};
