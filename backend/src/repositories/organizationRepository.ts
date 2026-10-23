import { getSupabaseClient } from '../config/database';
import { Organization, VerificationStatus } from '../types';
import { mockOrganizations } from './mockStore';

export class OrganizationRepository {
  async findAll(type?: 'donor' | 'ngo'): Promise<Organization[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      let query = supabase.from('organizations').select('*');
      if (type) query = query.eq('org_type', type);
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return data as Organization[];
    }

    if (type) return mockOrganizations.filter(o => o.org_type === type);
    return mockOrganizations;
  }

  async findById(id: string): Promise<Organization | null> {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase.from('organizations').select('*').eq('id', id).single();
      if (error) return null;
      return data as Organization;
    }

    return mockOrganizations.find(o => o.id === id) || null;
  }

  async findByUserId(userId: string): Promise<Organization | null> {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase.from('organizations').select('*').eq('user_id', userId).single();
      if (error) return null;
      return data as Organization;
    }

    return mockOrganizations.find(o => o.user_id === userId) || null;
  }

  async updateVerification(id: string, status: VerificationStatus): Promise<Organization | null> {
    const supabase = getSupabaseClient();
    const now = new Date().toISOString();

    if (supabase) {
      const { data, error } = await supabase
        .from('organizations')
        .update({ verification_status: status, updated_at: now })
        .eq('id', id)
        .select()
        .single();
      if (error) return null;
      return data as Organization;
    }

    const index = mockOrganizations.findIndex(o => o.id === id);
    if (index === -1) return null;
    mockOrganizations[index] = {
      ...mockOrganizations[index],
      verification_status: status,
      updated_at: now
    };
    return mockOrganizations[index];
  }
}

export const organizationRepository = new OrganizationRepository();
