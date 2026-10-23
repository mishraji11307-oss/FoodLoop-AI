import { getSupabaseClient } from '../config/database';
import { AuditLog } from '../types';
import { mockAuditLogs } from './mockStore';
import { randomUUID } from 'crypto';

export class AuditRepository {
  async log(
    action: string,
    entityType: string,
    entityId: string,
    details: Record<string, unknown>,
    actorId?: string,
    ipAddress?: string
  ): Promise<AuditLog> {
    const supabase = getSupabaseClient();
    const id = randomUUID();
    const record: AuditLog = {
      id,
      actor_id: actorId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      details,
      ip_address: ipAddress || '127.0.0.1',
      created_at: new Date().toISOString()
    };

    if (supabase) {
      try {
        const { data, error } = await supabase.from('audit_logs').insert(record).select().single();
        if (!error && data) return data as AuditLog;
      } catch (err) {
        console.warn('Failed to insert audit log to Supabase:', err);
      }
    }

    mockAuditLogs.unshift(record);
    return record;
  }

  async getRecent(limit = 50): Promise<AuditLog[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      if (!error && data) return data as AuditLog[];
    }

    return mockAuditLogs.slice(0, limit);
  }
}

export const auditRepository = new AuditRepository();
