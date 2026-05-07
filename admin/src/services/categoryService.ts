import { privateApi } from './api';
import type { ICategory, ICreateCategoryPayload, IUpdateCategoryPayload } from '@/types/category';
import axios from 'axios';

const categoryService = {
  getAll: async (): Promise<ICategory[]> => {
    const { data } = await privateApi.get<{ categories: ICategory[] }>('/categories');
    return data.categories;
  },

  create: async (payload: ICreateCategoryPayload & { categoryImage?: File }): Promise<ICategory> => {
    try {
      const formData = new FormData();
      formData.append('name', payload.name);
      formData.append('description', payload.description || '');
      if (payload.categoryImage) {
        formData.append('categoryImage', payload.categoryImage);
      }

      const { data } = await privateApi.post<{ category: ICategory }>('/categories', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data.category;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  },

  update: async (id: string, payload: IUpdateCategoryPayload & { categoryImage?: File }): Promise<ICategory> => {
    try {
      const formData = new FormData();
      if (payload.name) formData.append('name', payload.name);
      if (payload.description !== undefined) formData.append('description', payload.description);
      if (payload.categoryImage) {
        formData.append('categoryImage', payload.categoryImage);
      }

      const { data } = await privateApi.put<{ category: ICategory }>(`/categories/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data.category;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  },

  toggle: async (id: string): Promise<ICategory> => {
    const { data } = await privateApi.patch<{ category: ICategory }>(`/categories/${id}/toggle`);
    return data.category;
  },

  delete: async (id: string): Promise<void> => {
    await privateApi.delete(`/categories/${id}`);
  },
};

export default categoryService;
