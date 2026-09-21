import { apiClient } from '../lib/axios';
import type { AIFeedbackResponse, AISettingsResponse, SystemHealthResponse, UpdateAISettingsRequest, UpdateAISettingsResponse } from '../types/admin-system-health';

export const adminSystemHealthService = {
  async getSystemHealth(): Promise<SystemHealthResponse> { return (await apiClient.get<SystemHealthResponse>('/admin/system-health')).data; },
  async getAiSettings(): Promise<AISettingsResponse> { return (await apiClient.get<AISettingsResponse>('/admin/ai-settings')).data; },
  async updateAiSettings(request: UpdateAISettingsRequest): Promise<UpdateAISettingsResponse> { return (await apiClient.put<UpdateAISettingsResponse>('/admin/ai-settings', request)).data; },
  async getAiFeedback(): Promise<AIFeedbackResponse> { return (await apiClient.get<AIFeedbackResponse>('/admin/ai-feedback')).data; },
};
