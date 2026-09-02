import axios from 'axios';
import { env } from '../config/env';
import { getStoredAccessToken } from '../services/auth/session-storage';

export const apiClient = axios.create({ baseURL: env.apiBaseUrl });

apiClient.interceptors.request.use((config) => {
  const token = getStoredAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error),
);
