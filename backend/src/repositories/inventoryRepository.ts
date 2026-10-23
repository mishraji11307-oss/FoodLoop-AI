import { getSupabaseClient } from '../config/database';
import { InventoryItem, InventoryStatus } from '../types';
import { mockInventory } from './mockStore';
import { randomUUID } from 'crypto';

export class InventoryRepository {
  async findByUserId(
    userId: string,
    filters?: { status?: InventoryStatus; storage?: string }
  ): Promise<InventoryItem[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      let query = supabase.from('inventory_items').select('*').eq('user_id', userId);
      if (filters?.status) query = query.eq('status', filters.status);
      if (filters?.storage) query = query.eq('storage', filters.storage);
      const { data, error } = await query.order('expiry_date', { ascending: true });
      if (error) throw new Error(error.message);
      return data as InventoryItem[];
    }

    return mockInventory.filter(item => {
      if (item.user_id !== userId) return false;
      if (filters?.status && item.status !== filters.status) return false;
      if (filters?.storage && item.storage !== filters.storage) return false;
      return true;
    }).sort((a, b) => new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime());
  }

  async findById(id: string): Promise<InventoryItem | null> {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase.from('inventory_items').select('*').eq('id', id).single();
      if (error) return null;
      return data as InventoryItem;
    }

    return mockInventory.find(item => item.id === id) || null;
  }

  async create(item: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>): Promise<InventoryItem> {
    const supabase = getSupabaseClient();
    const id = randomUUID();
    const now = new Date().toISOString();

    const record: InventoryItem = {
      ...item,
      id,
      created_at: now,
      updated_at: now
    };

    if (supabase) {
      const { data, error } = await supabase.from('inventory_items').insert(record).select().single();
      if (error) throw new Error(error.message);
      return data as InventoryItem;
    }

    mockInventory.push(record);
    return record;
  }

  async update(id: string, updates: Partial<InventoryItem>): Promise<InventoryItem | null> {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('inventory_items')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) return null;
      return data as InventoryItem;
    }

    const index = mockInventory.findIndex(item => item.id === id);
    if (index === -1) return null;

    mockInventory[index] = {
      ...mockInventory[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    return mockInventory[index];
  }

  async delete(id: string): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { error } = await supabase.from('inventory_items').delete().eq('id', id);
      return !error;
    }

    const index = mockInventory.findIndex(item => item.id === id);
    if (index === -1) return false;
    mockInventory.splice(index, 1);
    return true;
  }
}

export const inventoryRepository = new InventoryRepository();
