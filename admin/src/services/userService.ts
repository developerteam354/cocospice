import { privateApi } from './api';
import type { IUser, IUserStats } from '@/types/user';

const userService = {
  getAll: async (): Promise<IUser[]> => {
    const { data } = await privateApi.get<{ users: IUser[]; total: number }>('/users');
    return data.users;
  },

  getStats: async (): Promise<IUserStats> => {
    const { data } = await privateApi.get<IUserStats>('/users/stats');
    return data;
  },

  // PATCH /api/admin/users/:id/toggle-status
  toggleStatus: async (id: string): Promise<{ _id: string; isActive: boolean }> => {
    const { data } = await privateApi.patch<{ user: { _id: string; isActive: boolean } }>(
      `/users/${id}/toggle-status`
    );
    return data.user;
  },
};

export default userService;
