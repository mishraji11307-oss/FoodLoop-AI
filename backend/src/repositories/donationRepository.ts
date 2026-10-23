import { getSupabaseClient } from '../config/database';
import {
  Donation,
  DonationRequest,
  DonationStatus,
  DeliveryConfirmation
} from '../types';
import {
  mockDonations,
  mockRequests,
  mockStatusHistory,
  mockDeliveries
} from './mockStore';
import { randomUUID } from 'crypto';

export class DonationRepository {
  async findDonations(filters?: {
    status?: DonationStatus;
    food_category?: string;
    donor_id?: string;
  }): Promise<Donation[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      let query = supabase.from('donations').select('*');
      if (filters?.status) query = query.eq('status', filters.status);
      if (filters?.food_category) query = query.eq('food_category', filters.food_category);
      if (filters?.donor_id) query = query.eq('donor_id', filters.donor_id);
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return data as Donation[];
    }

    return mockDonations.filter(d => {
      if (filters?.status && d.status !== filters.status) return false;
      if (filters?.food_category && d.food_category !== filters.food_category) return false;
      if (filters?.donor_id && d.donor_id !== filters.donor_id) return false;
      return true;
    });
  }

  async findDonationById(id: string): Promise<Donation | null> {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase.from('donations').select('*').eq('id', id).single();
      if (error) return null;
      return data as Donation;
    }

    return mockDonations.find(d => d.id === id) || null;
  }

  async createDonation(
    donation: Omit<Donation, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Donation> {
    const supabase = getSupabaseClient();
    const id = randomUUID();
    const now = new Date().toISOString();
    const record: Donation = {
      ...donation,
      id,
      created_at: now,
      updated_at: now
    };

    if (supabase) {
      const { data, error } = await supabase.from('donations').insert(record).select().single();
      if (error) throw new Error(error.message);
      return data as Donation;
    }

    mockDonations.unshift(record);
    return record;
  }

  async updateDonationStatus(
    id: string,
    newStatus: DonationStatus,
    changedByUserId: string,
    notes?: string,
    assignedNgoId?: string
  ): Promise<Donation | null> {
    const supabase = getSupabaseClient();
    const now = new Date().toISOString();

    if (supabase) {
      const { data: current } = await supabase.from('donations').select('status').eq('id', id).single();
      const prevStatus = current?.status;

      const updatePayload: Partial<Donation> = {
        status: newStatus,
        updated_at: now
      };
      if (assignedNgoId) updatePayload.assigned_ngo_id = assignedNgoId;

      const { data, error } = await supabase
        .from('donations')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .single();
      if (error) return null;

      // Record audit history
      await supabase.from('donation_status_history').insert({
        donation_id: id,
        previous_status: prevStatus,
        new_status: newStatus,
        changed_by_user_id: changedByUserId,
        notes,
        created_at: now
      });

      return data as Donation;
    }

    const index = mockDonations.findIndex(d => d.id === id);
    if (index === -1) return null;

    const prev = mockDonations[index].status;
    mockDonations[index] = {
      ...mockDonations[index],
      status: newStatus,
      assigned_ngo_id: assignedNgoId || mockDonations[index].assigned_ngo_id,
      updated_at: now
    };

    mockStatusHistory.push({
      id: `sh-${Date.now()}`,
      donation_id: id,
      previous_status: prev,
      new_status: newStatus,
      changed_by_user_id: changedByUserId,
      notes,
      created_at: now
    });

    return mockDonations[index];
  }

  async createRequest(
    request: Omit<DonationRequest, 'id' | 'created_at' | 'updated_at'>
  ): Promise<DonationRequest> {
    const supabase = getSupabaseClient();
    const id = randomUUID();
    const now = new Date().toISOString();
    const record: DonationRequest = {
      ...request,
      id,
      created_at: now,
      updated_at: now
    };

    if (supabase) {
      const { data, error } = await supabase.from('donation_requests').insert(record).select().single();
      if (error) throw new Error(error.message);
      return data as DonationRequest;
    }

    mockRequests.push(record);
    return record;
  }

  async findRequestsByDonationId(donationId: string): Promise<DonationRequest[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('donation_requests')
        .select('*')
        .eq('donation_id', donationId);
      if (error) throw new Error(error.message);
      return data as DonationRequest[];
    }

    return mockRequests.filter(r => r.donation_id === donationId);
  }

  async findRequestById(requestId: string): Promise<DonationRequest | null> {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('donation_requests')
        .select('*')
        .eq('id', requestId)
        .single();
      if (error) return null;
      return data as DonationRequest;
    }

    return mockRequests.find(r => r.id === requestId) || null;
  }

  async updateRequestStatus(
    requestId: string,
    status: DonationRequest['status']
  ): Promise<DonationRequest | null> {
    const supabase = getSupabaseClient();
    const now = new Date().toISOString();

    if (supabase) {
      const { data, error } = await supabase
        .from('donation_requests')
        .update({ status, updated_at: now })
        .eq('id', requestId)
        .select()
        .single();
      if (error) return null;
      return data as DonationRequest;
    }

    const index = mockRequests.findIndex(r => r.id === requestId);
    if (index === -1) return null;
    mockRequests[index] = { ...mockRequests[index], status, updated_at: now };
    return mockRequests[index];
  }

  async createDeliveryConfirmation(
    confirmation: Omit<DeliveryConfirmation, 'id' | 'created_at'>
  ): Promise<DeliveryConfirmation> {
    const supabase = getSupabaseClient();
    const id = randomUUID();
    const record: DeliveryConfirmation = {
      ...confirmation,
      id,
      created_at: new Date().toISOString()
    };

    if (supabase) {
      const { data, error } = await supabase.from('delivery_confirmations').insert(record).select().single();
      if (error) throw new Error(error.message);
      return data as DeliveryConfirmation;
    }

    mockDeliveries.push(record);
    return record;
  }

  async findDeliveryConfirmationByDonationId(donationId: string): Promise<DeliveryConfirmation | null> {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('delivery_confirmations')
        .select('*')
        .eq('donation_id', donationId)
        .single();
      if (error) return null;
      return data as DeliveryConfirmation;
    }

    return mockDeliveries.find(d => d.donation_id === donationId) || null;
  }
}

export const donationRepository = new DonationRepository();
