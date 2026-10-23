export type UserRole = 'household' | 'donor' | 'ngo' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  phone?: string;
  preferred_language?: string;
  created_at?: string;
  updated_at?: string;
}

export type OrgType = 'donor' | 'ngo';
export type VerificationStatus = 'pending' | 'verified' | 'rejected';

export interface Organization {
  id: string;
  user_id: string;
  name: string;
  org_type: OrgType;
  registration_number?: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  latitude: number;
  longitude: number;
  contact_phone: string;
  contact_email: string;
  verification_status: VerificationStatus;
  daily_capacity_kg: number;
  accepted_food_types: string[];
  created_at?: string;
  updated_at?: string;
}

export type DateLabelType = 'best_before' | 'use_by' | 'expiry';
export type InventoryStatus = 'fresh' | 'expiring_soon' | 'expired' | 'consumed' | 'wasted';
export type StorageLocation = 'fridge' | 'pantry' | 'freezer';

export interface InventoryItem {
  id: string;
  user_id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  storage: StorageLocation;
  purchase_date: string;
  expiry_date: string;
  date_label: DateLabelType;
  safety_guidance?: string;
  status: InventoryStatus;
  is_opened: boolean;
  opened_date?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AllergenPreferences {
  id: string;
  user_id: string;
  allergens: string[];
  dietary_flags: string[];
  strictness_level: 'warning' | 'strict';
}

export interface FoodLabelScan {
  id: string;
  user_id?: string;
  product_name: string;
  brand?: string;
  image_url?: string;
  extracted_text: string;
  ingredients: string[];
  nutrition_facts: {
    calories?: number;
    protein_g?: number;
    carbs_g?: number;
    sugar_g?: number;
    fat_g?: number;
    sat_fat_g?: number;
    sodium_mg?: number;
    fiber_g?: number;
  };
  detected_allergens: string[];
  health_score: number;
  nutri_grade: 'A' | 'B' | 'C' | 'D' | 'E';
  explanation_en: string;
  explanation_hi: string;
  preservatives_additives: string[];
  created_at?: string;
}

export type DonationStatus = 
  | 'available' 
  | 'requested' 
  | 'matched' 
  | 'in_transit' 
  | 'delivered' 
  | 'cancelled' 
  | 'expired';

export interface Donation {
  id: string;
  donor_id: string;
  donor_org_id?: string;
  title: string;
  food_category: string;
  quantity_kg: number;
  servings_estimate: number;
  perishable: boolean;
  prepared_at?: string;
  expiry_time: string;
  pickup_address: string;
  pickup_latitude: number;
  pickup_longitude: number;
  pickup_window_start: string;
  pickup_window_end: string;
  dietary_attributes: string[];
  packaging_notes?: string;
  status: DonationStatus;
  pickup_otp: string;
  delivery_otp: string;
  assigned_ngo_id?: string;
  created_at?: string;
  updated_at?: string;
}

export type RequestStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn';

export interface DonationRequest {
  id: string;
  donation_id: string;
  ngo_id: string;
  requester_user_id: string;
  match_score: number;
  status: RequestStatus;
  request_notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DonationStatusHistory {
  id: string;
  donation_id: string;
  previous_status?: DonationStatus;
  new_status: DonationStatus;
  changed_by_user_id: string;
  notes?: string;
  created_at?: string;
}

export interface DeliveryConfirmation {
  id: string;
  donation_id: string;
  ngo_id: string;
  pickup_timestamp?: string;
  pickup_verified_by?: string;
  delivery_timestamp?: string;
  delivery_verified_by?: string;
  beneficiaries_served?: number;
  confirmation_photo_url?: string;
  temperature_at_pickup?: number;
  handover_notes?: string;
  created_at?: string;
}

export type NotificationType = 
  | 'expiry_alert' 
  | 'donation_match' 
  | 'request_accepted' 
  | 'pickup_ready' 
  | 'delivery_completed' 
  | 'system_announcement';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  link_url?: string;
  is_read: boolean;
  created_at?: string;
}

export interface AuditLog {
  id: string;
  actor_id?: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  created_at?: string;
}
