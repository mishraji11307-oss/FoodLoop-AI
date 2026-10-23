import { getSupabaseClient } from '../config/database';
import { FoodLabelScan, AllergenPreferences } from '../types';
import { mockScans, mockAllergenPrefs } from './mockStore';
import { randomUUID } from 'crypto';

export class FoodLabelRepository {
  async saveScan(scan: Omit<FoodLabelScan, 'id' | 'created_at'>): Promise<FoodLabelScan> {
    const supabase = getSupabaseClient();
    const id = randomUUID();
    const record: FoodLabelScan = {
      ...scan,
      id,
      created_at: new Date().toISOString()
    };

    if (supabase) {
      const { data, error } = await supabase.from('food_label_scans').insert(record).select().single();
      if (error) throw new Error(error.message);
      return data as FoodLabelScan;
    }

    mockScans.unshift(record);
    return record;
  }

  async getScansByUserId(userId?: string): Promise<FoodLabelScan[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      let query = supabase.from('food_label_scans').select('*');
      if (userId) query = query.eq('user_id', userId);
      const { data, error } = await query.order('created_at', { ascending: false }).limit(20);
      if (error) throw new Error(error.message);
      return data as FoodLabelScan[];
    }

    if (userId) {
      return mockScans.filter(s => s.user_id === userId);
    }
    return mockScans.slice(0, 20);
  }

  async getAllergenPreferences(userId: string): Promise<AllergenPreferences | null> {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('allergen_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();
      if (error) return null;
      return data as AllergenPreferences;
    }

    return mockAllergenPrefs.find(p => p.user_id === userId) || null;
  }

  async saveAllergenPreferences(
    userId: string,
    allergens: string[],
    dietaryFlags: string[],
    strictness: 'warning' | 'strict'
  ): Promise<AllergenPreferences> {
    const supabase = getSupabaseClient();
    const payload = {
      user_id: userId,
      allergens,
      dietary_flags: dietaryFlags,
      strictness_level: strictness,
      updated_at: new Date().toISOString()
    };

    if (supabase) {
      const { data, error } = await supabase
        .from('allergen_preferences')
        .upsert(payload, { onConflict: 'user_id' })
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as AllergenPreferences;
    }

    const index = mockAllergenPrefs.findIndex(p => p.user_id === userId);
    if (index >= 0) {
      mockAllergenPrefs[index] = { ...mockAllergenPrefs[index], ...payload };
      return mockAllergenPrefs[index];
    }

    const newPref: AllergenPreferences = {
      id: `ap-${Date.now()}`,
      ...payload
    };
    mockAllergenPrefs.push(newPref);
    return newPref;
  }
}

export const foodLabelRepository = new FoodLabelRepository();
