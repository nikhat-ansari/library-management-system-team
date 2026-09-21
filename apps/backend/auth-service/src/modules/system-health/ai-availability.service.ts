import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class AiAvailabilityService {
  private readonly url = process.env.USER_SERVICE_URL ?? 'http://localhost:3002';

  async assertEnabled(): Promise<void> {
    try {
      const response = await axios.get<{ enabled: boolean }>(`${this.url}/api/admin/ai-settings`);
      if (!response.data.enabled) throw new ServiceUnavailableException({ available: false, reason: 'disabled', message: 'AI is disabled. The deterministic library feature remains available.' });
    } catch (error: unknown) {
      if (error instanceof ServiceUnavailableException) throw error;
      throw new ServiceUnavailableException({ available: false, reason: 'settings_unavailable', message: 'AI availability cannot be confirmed. The deterministic library feature remains available.' });
    }
  }
}
