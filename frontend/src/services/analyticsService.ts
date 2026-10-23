import { apiRequest } from './apiClient';
import { PlatformAnalytics } from '../types';

export const analyticsService = {
  async getImpact(): Promise<PlatformAnalytics> {
    return apiRequest<PlatformAnalytics>('/analytics');
  },

  async getAdminOrganizations(): Promise<any[]> {
    return apiRequest<any[]>('/admin/organizations');
  },

  async verifyOrganization(id: string, status: 'verified' | 'rejected', reason?: string): Promise<any> {
    return apiRequest<any>(`/admin/organizations/${id}/verify`, {
      method: 'PATCH',
      body: JSON.stringify({ verification_status: status, reason })
    });
  },

  async getAdminModerationLogs(): Promise<any[]> {
    return apiRequest<any[]>('/admin/moderation');
  }
};
