import { apiRequest } from './apiClient';
import { InventoryItem, InventoryStatus } from '../types';

export const inventoryService = {
  async getAll(params?: { status?: string; storage?: string }): Promise<InventoryItem[]> {
    const q = new URLSearchParams();
    if (params?.status) q.set('status', params.status);
    if (params?.storage) q.set('storage', params.storage);
    const qs = q.toString() ? `?${q.toString()}` : '';
    return apiRequest<InventoryItem[]>(`/inventory${qs}`);
  },

  async getById(id: string): Promise<InventoryItem> {
    return apiRequest<InventoryItem>(`/inventory/${id}`);
  },

  async create(item: Partial<InventoryItem>): Promise<InventoryItem> {
    return apiRequest<InventoryItem>('/inventory', {
      method: 'POST',
      body: JSON.stringify(item)
    });
  },

  async update(id: string, updates: Partial<InventoryItem>): Promise<InventoryItem> {
    return apiRequest<InventoryItem>(`/inventory/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  async updateStatus(id: string, status: InventoryStatus): Promise<InventoryItem> {
    return apiRequest<InventoryItem>(`/inventory/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  },

  async delete(id: string): Promise<void> {
    return apiRequest<void>(`/inventory/${id}`, {
      method: 'DELETE'
    });
  },

  async scanReceipt(rawText: string): Promise<any[]> {
    return apiRequest<any[]>('/inventory/receipt-scan', {
      method: 'POST',
      body: JSON.stringify({ rawText })
    });
  },

  async getRecipeSuggestions(): Promise<any[]> {
    return apiRequest<any[]>('/inventory/recipes');
  }
};
