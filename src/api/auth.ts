import { api } from './axios';
import type { ApiSuccess } from '@/types/api';
import type { User } from '@/types/models';

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export const authApi = {
  register: async (payload: { name: string; email: string; password: string }) => {
    const res = await api.post<ApiSuccess<AuthResponse>>('/auth/register', payload);
    return res.data.data;
  },
  login: async (payload: { email: string; password: string }) => {
    const res = await api.post<ApiSuccess<AuthResponse>>('/auth/login', payload);
    return res.data.data;
  },
  refresh: async () => {
    const res = await api.post<ApiSuccess<AuthResponse>>('/auth/refresh');
    return res.data.data;
  },
  logout: async () => {
    await api.post('/auth/logout');
  },
  me: async () => {
    const res = await api.get<ApiSuccess<User>>('/auth/me');
    return res.data.data;
  },
};
