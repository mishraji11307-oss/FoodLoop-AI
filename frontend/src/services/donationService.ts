import { apiRequest } from './apiClient';
import { Donation, DonationRequest } from '../types';

export const donationService = {
  async getAll(params?: { status?: string; food_category?: string }): Promise<Donation[]> {
    const q = new URLSearchParams();
    if (params?.status) q.set('status', params.status);
    if (params?.food_category) q.set('food_category', params.food_category);
    const qs = q.toString() ? `?${q.toString()}` : '';
    return apiRequest<Donation[]>(`/donations${qs}`);
  },

  async getById(id: string): Promise<Donation> {
    return apiRequest<Donation>(`/donations/${id}`);
  },

  async create(data: Partial<Donation>): Promise<Donation> {
    return apiRequest<Donation>('/donations', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async requestDonation(donationId: string, ngoId: string, notes?: string): Promise<DonationRequest> {
    return apiRequest<DonationRequest>(`/donations/${donationId}/requests`, {
      method: 'POST',
      body: JSON.stringify({ ngo_id: ngoId, request_notes: notes })
    });
  },

  async getRequests(donationId: string): Promise<DonationRequest[]> {
    return apiRequest<DonationRequest[]>(`/donations/${donationId}/requests`);
  },

  async acceptRequest(requestId: string): Promise<Donation> {
    return apiRequest<Donation>(`/donation-requests/${requestId}/accept`, {
      method: 'POST'
    });
  },

  async rejectRequest(requestId: string): Promise<any> {
    return apiRequest<any>(`/donation-requests/${requestId}/reject`, {
      method: 'POST'
    });
  },

  async confirmPickup(donationId: string, otp: string, details?: { temperature_celsius?: number; notes?: string }): Promise<Donation> {
    return apiRequest<Donation>(`/donations/${donationId}/pickup-confirmation`, {
      method: 'POST',
      body: JSON.stringify({ otp, ...details })
    });
  },

  async confirmDelivery(donationId: string, otp: string, details?: { beneficiaries_served?: number; confirmation_notes?: string }): Promise<Donation> {
    return apiRequest<Donation>(`/donations/${donationId}/delivery-confirmation`, {
      method: 'POST',
      body: JSON.stringify({ otp, ...details })
    });
  }
};
