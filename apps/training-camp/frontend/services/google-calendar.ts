import { apiClient } from './index'

export const googleCalendarApi = {
  async getAuthUrl(): Promise<string> {
    const { url } = await apiClient.get<{ url: string }>('/calendar/google/auth-url')
    return url
  },

  async getStatus(): Promise<boolean> {
    const { connected } = await apiClient.get<{ connected: boolean }>('/calendar/google/status')
    return connected
  },

  async disconnect(): Promise<void> {
    await apiClient.delete<{ success: boolean }>('/calendar/google/disconnect')
  },
}
