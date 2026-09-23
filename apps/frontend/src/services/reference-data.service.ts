import { apiClient } from '../lib/axios';
import type { Category, Author, Publisher } from '../types/reference-data';

export const referenceDataService = {
  async getCategories(): Promise<Category[]> {
    const { data } = await apiClient.get<Category[]>('/categories');
    return data;
  },

  async getAuthors(): Promise<Author[]> {
    const { data } = await apiClient.get<Author[]>('/authors');
    return data;
  },

  async getPublishers(): Promise<Publisher[]> {
    const { data } = await apiClient.get<Publisher[]>('/publishers');
    return data;
  }
};
