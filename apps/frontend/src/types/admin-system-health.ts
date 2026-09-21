export interface SystemHealthResponse {
  retentionDays: number;
  application: { apiErrors: number };
  notifications: { deliveryFailures: number };
  ai: {
    enabled: boolean;
    usage: number;
    errors: number;
    providerFailures: number;
    timeouts: number;
    unavailable: number;
    fallbackUsed: number;
  };
}

export interface AISettingsResponse { enabled: boolean; }
export interface UpdateAISettingsRequest { enabled: boolean; }
export type UpdateAISettingsResponse = AISettingsResponse;
export interface AIFeedbackResponse { retentionDays: number; helpful: number; notHelpful: number; }
