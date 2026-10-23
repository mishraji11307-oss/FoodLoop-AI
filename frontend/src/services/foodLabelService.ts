import { apiRequest } from './apiClient';
import { FoodLabelScan } from '../types';

export const foodLabelService = {
  async scanLabel(payload: {
    product_name: string;
    brand?: string;
    raw_text: string;
    user_allergens?: string[];
    image_url?: string;
  }): Promise<FoodLabelScan> {
    return apiRequest<FoodLabelScan>('/food-labels/scan', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async getHistory(): Promise<FoodLabelScan[]> {
    return apiRequest<FoodLabelScan[]>('/food-labels/history');
  },

  async getAllergenPreferences(): Promise<any> {
    return apiRequest<any>('/food-labels/preferences');
  },

  async updateAllergenPreferences(allergens: string[], dietary_flags: string[] = [], strictness_level = 'warning'): Promise<any> {
    return apiRequest<any>('/food-labels/preferences', {
      method: 'PUT',
      body: JSON.stringify({ allergens, dietary_flags, strictness_level })
    });
  }
};
