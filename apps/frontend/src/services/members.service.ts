import { apiClient as api } from '../lib/axios';

export interface Member {
  id: string;
  name: string;
  email: string;
  status: string;
}

export const membersService = {
  searchMembers: async (query: string): Promise<Member[]> => {
    const { data } = await api.get('/users/search/members', { params: { q: query } });
    return data;
  }
};
