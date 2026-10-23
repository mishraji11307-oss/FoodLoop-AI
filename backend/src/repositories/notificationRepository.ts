import { getSupabaseClient } from '../config/database';
import { Notification } from '../types';
import { mockNotifications } from './mockStore';
import { randomUUID } from 'crypto';

export class NotificationRepository {
  async findByUserId(userId: string): Promise<Notification[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return data as Notification[];
    }

    return mockNotifications.filter(n => n.user_id === userId);
  }

  async markAsRead(id: string, userId: string): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id)
        .eq('user_id', userId);
      return !error;
    }

    const item = mockNotifications.find(n => n.id === id && n.user_id === userId);
    if (!item) return false;
    item.is_read = true;
    return true;
  }

  async create(notification: Omit<Notification, 'id' | 'created_at' | 'is_read'> & { is_read?: boolean }): Promise<Notification> {
    const supabase = getSupabaseClient();
    const id = randomUUID();
    const record: Notification = {
      is_read: false,
      ...notification,
      id,
      created_at: new Date().toISOString()
    };

    if (supabase) {
      const { data, error } = await supabase.from('notifications').insert(record).select().single();
      if (error) throw new Error(error.message);
      return data as Notification;
    }

    mockNotifications.unshift(record);
    return record;
  }
}

export const notificationRepository = new NotificationRepository();
